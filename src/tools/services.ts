import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OmvClient } from "../omv-client.js";

function toolResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

export function registerServiceTools(server: McpServer, client: OmvClient) {
  // ── Get Services Status ──────────────────────────────────────────────
  server.tool(
    "get_services_status",
    "Get the status of all OpenMediaVault services (SMB, NFS, SSH, FTP, rsync, etc.) showing which are enabled and running",
    {},
    async () => {
      try {
        const result = await client.rpc("Services", "getStatus", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching services status: ${error}`,
          true,
        );
      }
    },
  );

  // ── List Cron Jobs ───────────────────────────────────────────────────
  server.tool(
    "list_cron_jobs",
    "List all scheduled cron jobs configured in OpenMediaVault with command, schedule expression, and enabled status",
    {},
    async () => {
      try {
        const result = await client.getList("Cron", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching cron jobs: ${error}`, true);
      }
    },
  );

  // ── Get SSH Settings ─────────────────────────────────────────────────
  server.tool(
    "get_ssh_settings",
    "Get SSH service settings including port, password authentication, and enabled status",
    {},
    async () => {
      try {
        const result = await client.rpc("SSH", "getSettings", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching SSH settings: ${error}`, true);
      }
    },
  );

  // ── List Rsync Jobs ──────────────────────────────────────────────────
  server.tool(
    "list_rsync_jobs",
    "List all rsync backup/sync jobs configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("Rsync", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching rsync jobs: ${error}`, true);
      }
    },
  );

  // ── List Rsync Modules ───────────────────────────────────────────────
  server.tool(
    "list_rsync_modules",
    "List rsync daemon modules (server-side rsync shares) configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("Rsync", "getModuleList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching rsync modules: ${error}`, true);
      }
    },
  );

  // ── Get Rsync Settings ───────────────────────────────────────────────
  server.tool(
    "get_rsync_settings",
    "Get global rsync daemon settings",
    {},
    async () => {
      try {
        const result = await client.rpc("Rsync", "getSettings", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching rsync settings: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get Notification Settings ────────────────────────────────────────
  server.tool(
    "get_notification_settings",
    "Get email notification settings configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.rpc("EmailNotification", "get", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching notification settings: ${error}`,
          true,
        );
      }
    },
  );

  // ── Get Update Information ───────────────────────────────────────────
  server.tool(
    "get_updates",
    "Check for available software updates in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.rpc("Apt", "getUpgraded", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching update information: ${error}`,
          true,
        );
      }
    },
  );

  // ── List Installed Plugins ───────────────────────────────────────────
  server.tool(
    "list_plugins",
    "List all installed OpenMediaVault plugins",
    {},
    async () => {
      try {
        const result = await client.rpc("Plugin", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching plugin list: ${error}`, true);
      }
    },
  );

  // ── Get Watchdog Settings ────────────────────────────────────────────
  server.tool(
    "get_watchdog_settings",
    "Get hardware watchdog timer settings for system health monitoring",
    {},
    async () => {
      try {
        const result = await client.rpc("WatchDog", "getSettings", {});
        return toolResult(
          JSON.stringify(result, null, 2),
        );
      } catch (error) {
        return toolResult(
          `Error fetching watchdog settings: ${error}`,
          true,
        );
      }
    },
  );
}
