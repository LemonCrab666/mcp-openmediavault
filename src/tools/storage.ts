
import { OmvClient } from "../omv-client.js";

export function registerStorageTools(
  server: any,
  client: OmvClient,
): void {
  server.tool(
    "list_disks",
    "List all physical disks",
    {},
    async () => {
      try {
        const result = await client.getList("DiskMgmt", "getListBg", {});
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
              text: "Error listing disks: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_filesystems",
    "List all filesystems",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.getList("FileSystemMgmt", "enumerateFilesystems", {});
        } else {
          result = await client.getList("FileSystemMgmt", "enumerateFileSystems", {});
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
              text: "Error listing filesystems: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_mounted_filesystems",
    "List all mounted filesystems",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.getList("FileSystemMgmt", "enumerateMountedFilesystems", {});
        } else {
          result = await client.getList("FileSystemMgmt", "enumerateMountedFileSystems", {});
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
              text: "Error listing mounted filesystems: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_filesystem_candidates",
    "Get filesystem creation candidates (available disks)",
    {},
    async () => {
      try {
        const result = await client.getList("FileSystemMgmt", "getCandidatesBg", {});
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
              text: "Error getting filesystem candidates: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_smart_info",
    "Get S.M.A.R.T. info for a disk",
    {
      device: {
        type: "string",
        description: "Device name (e.g., /dev/sda)",
        required: true,
      },
    },
    async (args: any) => {
      try {
        const result = await client.rpc("Smart", "getInformation", {
          devicefile: args.device,
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
              text: "Error getting S.M.A.R.T. info: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_raid_devices",
    "List RAID devices (if available)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = { note: "RAID management is handled via DiskMgmt on OMV 8; use list_disks to see all drives" };
        } else {
          result = await client.getList("RaidMgmt", "getList", {});
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
              text: "RAID info not available: " + error.message,
            },
          ],
        };
      }
    },
  );
}
