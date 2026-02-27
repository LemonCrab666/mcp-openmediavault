import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OmvClient } from "../omv-client.js";

function toolResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

export function registerStorageTools(server: McpServer, client: OmvClient) {
  // ── List Disks ───────────────────────────────────────────────────────
  server.tool(
    "list_disks",
    "List all physical disks detected by OpenMediaVault including model, vendor, size, serial number, temperature, and SMART status",
    {},
    async () => {
      try {
        const result = await client.getList("DiskMgmt", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching disk list: ${error}`, true);
      }
    },
  );

  // ── List Filesystems ─────────────────────────────────────────────────
  server.tool(
    "list_filesystems",
    "List all filesystems on the OpenMediaVault system including type, label, size, usage, and mount status",
    {},
    async () => {
      try {
        const result = await client.rpc(
          "FileSystemMgmt",
          "enumerateFileSystems",
          {},
        );
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching filesystem list: ${error}`, true);
      }
    },
  );

  // ── Get Mounted Filesystems ──────────────────────────────────────────
  server.tool(
    "get_mounted_filesystems",
    "Get all currently mounted filesystems with their usage statistics",
    {},
    async () => {
      try {
        const result = await client.rpc(
          "FileSystemMgmt",
          "enumerateMountedFileSystems",
          {},
        );
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching mounted filesystems: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get SMART Info ───────────────────────────────────────────────────
  server.tool(
    "get_smart_info",
    "Get SMART attributes for a specific disk device to assess disk health",
    {
      devicefile: z
        .string()
        .describe(
          "Device file path of the disk (e.g., /dev/sda, /dev/sdb). Use list_disks to find device files.",
        ),
    },
    async ({ devicefile }) => {
      try {
        const result = await client.rpc("Smart", "getAttributes", {
          devicefile,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching SMART info for ${devicefile}: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get SMART Extended Info ──────────────────────────────────────────
  server.tool(
    "get_smart_extended_info",
    "Get extended SMART information for a specific disk including self-test results",
    {
      devicefile: z
        .string()
        .describe("Device file path of the disk (e.g., /dev/sda)"),
    },
    async ({ devicefile }) => {
      try {
        const result = await client.rpc("Smart", "getExtendedInformation", {
          devicefile,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching extended SMART info for ${devicefile}: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get SMART Settings ───────────────────────────────────────────────
  server.tool(
    "get_smart_device_settings",
    "Get SMART monitoring settings for a specific disk",
    {
      devicefile: z
        .string()
        .describe("Device file path of the disk (e.g., /dev/sda)"),
    },
    async ({ devicefile }) => {
      try {
        const result = await client.rpc("Smart", "getDeviceSettings", {
          devicefile,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching SMART settings for ${devicefile}: ${error}`,
          true,
        );
      }
    },
  );

  // ── List SMART Scheduled Jobs ────────────────────────────────────────
  server.tool(
    "list_smart_jobs",
    "List all scheduled SMART self-test jobs configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("Smart", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching SMART jobs: ${error}`, true);
      }
    },
  );

  // ── Get RAID Devices ─────────────────────────────────────────────────
  server.tool(
    "list_raid_devices",
    "List all software RAID (mdadm) devices configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("RaidMgmt", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching RAID devices: ${error}`, true);
      }
    },
  );
}
