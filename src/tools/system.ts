
import { OmvClient } from "../omv-client.js";

export function registerSystemTools(
  server: any,
  client: OmvClient,
): void {
  server.tool(
    "get_system_information",
    "Get detailed system information from OMV",
    {},
    async () => {
      try {
        const result = await client.rpc("System", "getInformation", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting system information: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_system_stats",
    "Get real-time CPU and memory stats",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("System", "getTopInfo", {});
        } else {
          result = await client.rpc("System", "getStats", {});
        }
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting system stats: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_system_timezone_list",
    "Get list of available timezones",
    {},
    async () => {
      try {
        const result = await client.rpc("System", "getTimeZoneList", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting timezone list: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_cpu_temperature",
    "Get CPU temperature info (may require sensors plugin)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          try {
            result = await client.rpc("PerfStats", "get", { name: "cpu" });
          } catch {
            result = { note: "CPU temperature monitoring not available on OMV 8" };
          }
        } else {
          result = await client.rpc("CpuTemp", "getStats", {});
        }
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "CPU temperature monitoring not available: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_network_interfaces",
    "Get network interface list",
    {},
    async () => {
      try {
        const result = await client.rpc("Network", "getInterfaceList", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting network interfaces: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_system_logs",
    "Get system log entries",
    {
      lines: {
        type: "number",
        description: "Number of log lines to fetch",
        default: 50,
      },
    },
    async (args: any) => {
      try {
        const result = await client.rpc("Syslog", "getList", {
          start: 0,
          limit: args.lines || 50,
          sortfield: null,
          sortdir: "DESC",
        });
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting system logs: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_power_status",
    "Get UPS/power management status",
    {},
    async () => {
      try {
        const result = await client.rpc("PowerMgmt", "get", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting power status: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_available_upgrades",
    "List available package upgrades",
    {},
    async () => {
      try {
        const result = await client.rpc("Apt", "getUpgradedList", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting upgrade list: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "enumerate_network_devices",
    "Enumerate network devices on the system",
    {},
    async () => {
      try {
        const result = await client.rpc("Network", "enumerateDevices", {});
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error enumerating network devices: " + error.message,
            },
          ],
        };
      }
    },
  );
}
