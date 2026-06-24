
import { OmvClient } from "../omv-client.js";

export function registerShareTools(
  server: any,
  client: OmvClient,
): void {
  server.tool(
    "list_shares",
    "List all shared folders",
    {},
    async () => {
      try {
        const result = await client.getList("ShareMgmt", "getList", {});
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
              text: "Error listing shares: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_share_privileges",
    "Get privileges for a shared folder",
    {
      uuid: {
        type: "string",
        description: "UUID of the shared folder",
        required: true,
      },
    },
    async (args: any) => {
      try {
        const result = await client.rpc("ShareMgmt", "getPrivileges", {
          uuid: args.uuid,
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
              text: "Error getting share privileges: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_ftp_shares",
    "List FTP shares (if FTP plugin is installed)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = { note: "FTP is not available in OMV 8 core; install the openmediavault-ftp plugin if needed" };
        } else {
          result = await client.getList("FTP", "getShareList", {});
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
              text: "Error getting FTP shares: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_ftp_settings",
    "Get FTP server settings (if FTP plugin is installed)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = { note: "FTP is not available in OMV 8 core; install the openmediavault-ftp plugin if needed" };
        } else {
          result = await client.rpc("FTP", "getSettings", {});
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
              text: "Error getting FTP settings: " + error.message,
            },
          ],
        };
      }
    },
  );
}
