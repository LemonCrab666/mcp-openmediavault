import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OmvClient } from "../omv-client.js";

function toolResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

export function registerSystemTools(server: McpServer, client: OmvClient) {
  // ── Get System Information ───────────────────────────────────────────
  server.tool(
    "get_system_info",
    "Get OpenMediaVault system information including hostname, version, CPU model, uptime, and memory",
    {},
    async () => {
      try {
        const result = await client.rpc("System", "getInformation", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching system info: ${error}`, true);
      }
    },
  );

  // ── Get System Statistics ────────────────────────────────────────────
  server.tool(
    "get_system_stats",
    "Get OpenMediaVault system statistics including CPU usage, memory usage, and load averages",
    {},
    async () => {
      try {
        const result = await client.rpc("System", "getStats", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching system stats: ${error}`, true);
      }
    },
  );

  // ── Get CPU Temperature ──────────────────────────────────────────────
  server.tool(
    "get_cpu_temp",
    "Get CPU temperature readings from OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.rpc("CpuTemp", "getStats", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching CPU temperature: ${error}`, true);
      }
    },
  );

  // ── Get Network Interfaces ───────────────────────────────────────────
  server.tool(
    "get_network_interfaces",
    "List all network interfaces on the OpenMediaVault system with IP, netmask, gateway, and speed",
    {
      enumerate: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "If true, enumerate all detected devices. If false, list configured interfaces.",
        ),
    },
    async ({ enumerate }) => {
      try {
        let result: unknown;
        if (enumerate) {
          result = await client.rpc("Network", "enumerateDevices", {});
        } else {
          result = await client.getList("Network", "getInterfaceList", {
            start: 0,
            limit: 100,
            sortfield: null,
            sortdir: null,
          });
        }
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching network interfaces: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get System Log ───────────────────────────────────────────────────
  server.tool(
    "get_system_log",
    "Retrieve system log entries from OpenMediaVault (syslog)",
    {
      limit: z
        .number()
        .optional()
        .default(100)
        .describe("Maximum number of log lines to retrieve"),
    },
    async ({ limit }) => {
      try {
        const result = await client.rpc("Syslog", "getList", {
          start: 0,
          limit,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching system log: ${error}`, true);
      }
    },
  );

  // ── Get Power Management ─────────────────────────────────────────────
  server.tool(
    "get_power_management",
    "Get power management settings (scheduled shutdown, wake-on-LAN, etc.)",
    {},
    async () => {
      try {
        const result = await client.rpc("PowerMgmt", "get", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching power management settings: ${error}`,
          true,
        );
      }
    },
  );
}
