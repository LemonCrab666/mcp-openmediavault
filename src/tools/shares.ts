import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OmvClient } from "../omv-client.js";

function toolResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

export function registerShareTools(server: McpServer, client: OmvClient) {
  // ── List Shared Folders ──────────────────────────────────────────────
  server.tool(
    "list_shared_folders",
    "List all shared folders configured in OpenMediaVault with their filesystem references and privileges",
    {},
    async () => {
      try {
        const result = await client.getList("ShareMgmt", "getList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching shared folders: ${error}`, true);
      }
    },
  );

  // ── Get Shared Folder Privileges ─────────────────────────────────────
  server.tool(
    "get_shared_folder_privileges",
    "Get user and group access privileges for a specific shared folder",
    {
      uuid: z
        .string()
        .describe(
          "UUID of the shared folder. Use list_shared_folders to find UUIDs.",
        ),
    },
    async ({ uuid }) => {
      try {
        const result = await client.rpc("ShareMgmt", "getPrivileges", {
          uuid,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching privileges for shared folder ${uuid}: ${error}`,
          true,
        );
      }
    },
  );

  // ── List SMB Shares ──────────────────────────────────────────────────
  server.tool(
    "list_smb_shares",
    "List all SMB/CIFS (Windows/Samba) network shares configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("SMB", "getShareList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching SMB shares: ${error}`, true);
      }
    },
  );

  // ── Get SMB Settings ─────────────────────────────────────────────────
  server.tool(
    "get_smb_settings",
    "Get global SMB/CIFS service settings including workgroup, description, and enabled status",
    {},
    async () => {
      try {
        const result = await client.rpc("SMB", "getSettings", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching SMB settings: ${error}`, true);
      }
    },
  );

  // ── List NFS Shares ──────────────────────────────────────────────────
  server.tool(
    "list_nfs_shares",
    "List all NFS (Network File System) shares configured in OpenMediaVault with client and export options",
    {},
    async () => {
      try {
        const result = await client.getList("NFS", "getShareList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching NFS shares: ${error}`, true);
      }
    },
  );

  // ── Get NFS Settings ─────────────────────────────────────────────────
  server.tool(
    "get_nfs_settings",
    "Get global NFS service settings and enabled status",
    {},
    async () => {
      try {
        const result = await client.rpc("NFS", "getSettings", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching NFS settings: ${error}`, true);
      }
    },
  );

  // ── List FTP Shares ──────────────────────────────────────────────────
  server.tool(
    "list_ftp_shares",
    "List all FTP shares configured in OpenMediaVault",
    {},
    async () => {
      try {
        const result = await client.getList("FTP", "getShareList", {
          start: 0,
          limit: 100,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching FTP shares: ${error}`, true);
      }
    },
  );

  // ── Get FTP Settings ─────────────────────────────────────────────────
  server.tool(
    "get_ftp_settings",
    "Get global FTP service settings including port, max connections, and enabled status",
    {},
    async () => {
      try {
        const result = await client.rpc("FTP", "getSettings", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching FTP settings: ${error}`, true);
      }
    },
  );
}
