
import { OmvClient } from "../omv-client.js";

export function registerServiceTools(
  server: any,
  client: OmvClient,
): void {
  server.tool(
    "get_service_status",
    "Get status of all OMV services",
    {},
    async () => {
      try {
        const result = await client.rpc("Services", "getStatus", {});
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
              text: "Error getting service status: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_smb_settings",
    "Get SMB/CIFS settings",
    {},
    async () => {
      try {
        const result = await client.rpc("Smb", "getSettings", {});
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
              text: "Error getting SMB settings: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_smb_shares",
    "Get SMB/CIFS shares",
    {},
    async () => {
      try {
        const result = await client.getList("Smb", "getShareList", {});
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
              text: "Error getting SMB shares: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_nfs_settings",
    "Get NFS settings",
    {},
    async () => {
      try {
        const result = await client.rpc("Nfs", "getSettings", {});
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
              text: "Error getting NFS settings: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_nfs_shares",
    "Get NFS shares",
    {},
    async () => {
      try {
        const result = await client.getList("Nfs", "getShareList", {});
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
              text: "Error getting NFS shares: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_ssh_settings",
    "Get SSH server settings",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("SSH", "get", {});
        } else {
          result = await client.rpc("SSH", "getSettings", {});
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
              text: "Error getting SSH settings: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_rsync_settings",
    "Get Rsync server settings and module list",
    {},
    async () => {
      try {
        let settings;
        let modules;
        if (client.omvVersion === "omv8") {
          // OMV 8: Rsync settings/modules are on Rsyncd service
          settings = await client.rpc("Rsyncd", "getSettings", {});
          modules = await client.getList("Rsyncd", "getModuleList", {});
        } else {
          settings = await client.rpc("Rsync", "getSettings", {});
          modules = await client.getList("Rsync", "getModuleList", {});
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ settings, modules }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: "Error getting Rsync settings: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_cron_jobs",
    "Get scheduled cron jobs",
    {},
    async () => {
      try {
        const result = await client.getList("Cron", "getList", {});
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
              text: "Error getting cron jobs: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_email_settings",
    "Get email notification settings",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("Notification", "get", {});
        } else {
          result = await client.rpc("EmailNotification", "get", {});
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
              text: "Error getting email settings: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_installed_plugins",
    "Get list of installed OMV plugins",
    {},
    async () => {
      try {
        const result = await client.getList("Plugin", "getList", {});
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
              text: "Error getting plugins: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_watchdog_settings",
    "Get watchdog settings (if available)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = { note: "WatchDog service is not available in OMV 8 core" };
        } else {
          result = await client.rpc("WatchDog", "getSettings", {});
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
              text: "WatchDog info not available: " + error.message,
            },
          ],
        };
      }
    },
  );
}
