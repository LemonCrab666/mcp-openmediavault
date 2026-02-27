#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
    allowSelfSigned: process.env.OMV_ALLOW_SELF_SIGNED !== "false",
  };
}

async function main() {
  const config = getConfig();
  const client = new OmvClient(config);

  const server = new McpServer({
    name: "openmediavault",
    version: "1.0.0",
  });

  registerSystemTools(server, client);
  registerStorageTools(server, client);
  registerShareTools(server, client);
  registerUserTools(server, client);
  registerServiceTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("OpenMediaVault MCP server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
