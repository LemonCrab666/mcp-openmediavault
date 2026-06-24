#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { OmvClient } from "./omv-client.js";
import { registerSystemTools } from "./tools/system.js";
import { registerStorageTools } from "./tools/storage.js";
import { registerShareTools } from "./tools/shares.js";
import { registerUserTools } from "./tools/users.js";
import { registerServiceTools } from "./tools/services.js";

function getConfig() {
  const host = process.env.OMV_HOST;
  const password = process.env.OMV_PASSWORD;

  if (!host || !password) {
    console.error(
      "Missing required environment variables: OMV_HOST, OMV_PASSWORD",
    );
    process.exit(1);
  }

  return {
    host,
    username: process.env.OMV_USERNAME || "admin",
    password,
    allowSelfSigned: true,
  };
}

function createServer(client: OmvClient): McpServer {
  const server = new McpServer({
    name: "openmediavault",
    version: "1.0.0",
  });

  registerSystemTools(server, client);
  registerStorageTools(server, client);
  registerShareTools(server, client);
  registerUserTools(server, client);
  registerServiceTools(server, client);

  return server;
}

async function main() {
  const config = getConfig();
  const client = new OmvClient(config);

  // Detect OMV version at startup
  try {
    await client.detectVersion();
    console.error("OMV version detected:", client.omvVersion);
  } catch (error: any) {
    console.error("Warning: could not detect OMV version:", error.message);
  }

  const transportMode = process.env.MCP_TRANSPORT || "stdio";

  if (transportMode === "streamable-http") {
    // ── StreamableHTTP mode (compatible with Hermes) ──────────────
    const port = parseInt(process.env.MCP_PORT || "3100", 10);
    const host = process.env.MCP_HOST || "0.0.0.0";

    const app = express();
    app.use(express.json());

    // Per-request transport: each POST creates a fresh transport + server
    // This enables stateless operation (no Mcp-Session-Id header required from client)
    app.post("/mcp", async (req, res) => {
      try {
        // Fresh transport per request (stateless mode + JSON response)
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });
        const server = createServer(client);
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (error: any) {
        console.error("Error handling StreamableHTTP request:", error.message);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal error" });
        }
      }
    });

    // Also accept GET for SSE-based clients that might connect
    app.get("/sse", async (req, res) => {
      console.error("SSE connection from:", req.ip);
      const sseTransport = new SSEServerTransport("/messages", res);
      const sessionId = sseTransport.sessionId;

      res.on("close", () => {
        console.error("SSE session closed:", sessionId);
      });

      try {
        const sseServer = createServer(client);
        await sseServer.connect(sseTransport);
      } catch (error: any) {
        console.error("Error in SSE session:", error.message);
      }
    });

    // Keep /messages for SSE clients
    app.post("/messages", async (req, res) => {
      console.error("Warning: SSE /messages called but no active SSE sessions");
      res.status(404).send("Session not found");
    });

    app.listen(port, host, () => {
      console.error(
        "OpenMediaVault MCP server (StreamableHTTP mode) on",
        host + ":" + port,
      );
      console.error("  POST /mcp  — StreamableHTTP endpoint (per-request stateless)");
      console.error("  GET  /sse  — SSE endpoint (legacy support)");
    });
  } else if (transportMode === "sse") {
    // ── Legacy SSE mode ──────────────────────────────────────────
    const port = parseInt(process.env.MCP_PORT || "3100", 10);
    const host = process.env.MCP_HOST || "0.0.0.0";

    const app = express();
    app.use(express.json());

    const transports: Record<string, SSEServerTransport> = {};

    app.get("/sse", async (req, res) => {
      console.error("SSE connection from:", req.ip);
      const transport = new SSEServerTransport("/messages", res);
      const sessionId = transport.sessionId;
      transports[sessionId] = transport;

      res.on("close", () => {
        console.error("SSE session closed:", sessionId);
        delete transports[sessionId];
      });

      try {
        const server = createServer(client);
        await server.connect(transport);
      } catch (error: any) {
        console.error("Error in SSE session:", error.message);
      }
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        res.status(400).send("Missing sessionId");
        return;
      }
      const transport = transports[sessionId];
      if (!transport) {
        res.status(404).send("Session not found");
        return;
      }
      try {
        await transport.handlePostMessage(req, res, req.body);
      } catch (error: any) {
        console.error("Error handling message:", error.message);
        if (!res.headersSent) {
          res.status(500).send("Internal error");
        }
      }
    });

    app.listen(port, host, () => {
      console.error(
        "OpenMediaVault MCP server (SSE mode) on",
        host + ":" + port,
      );
    });
  } else {
    // ── Stdio mode ───────────────────────────────────────────────
    const server = createServer(client);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("OpenMediaVault MCP server (stdio mode) running");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
