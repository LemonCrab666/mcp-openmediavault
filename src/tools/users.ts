import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OmvClient } from "../omv-client.js";

function toolResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError };
}

export function registerUserTools(server: McpServer, client: OmvClient) {
  // ── List Users ───────────────────────────────────────────────────────
  server.tool(
    "list_users",
    "List all local user accounts in OpenMediaVault with UID, GID, groups, and account details",
    {
      limit: z
        .number()
        .optional()
        .default(100)
        .describe("Maximum number of users to return"),
    },
    async ({ limit }) => {
      try {
        const result = await client.getList("UserMgmt", "getList", {
          start: 0,
          limit,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching user list: ${error}`, true);
      }
    },
  );

  // ── Get User Details ─────────────────────────────────────────────────
  server.tool(
    "get_user",
    "Get detailed information about a specific user account",
    {
      name: z.string().describe("Username to look up"),
    },
    async ({ name }) => {
      try {
        const result = await client.rpc("UserMgmt", "get", { name });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching user '${name}': ${error}`,
          true,
        );
      }
    },
  );

  // ── List Groups ──────────────────────────────────────────────────────
  server.tool(
    "list_groups",
    "List all local groups in OpenMediaVault with GID, comment, and member list",
    {
      limit: z
        .number()
        .optional()
        .default(100)
        .describe("Maximum number of groups to return"),
    },
    async ({ limit }) => {
      try {
        const result = await client.getList("GroupMgmt", "getList", {
          start: 0,
          limit,
          sortfield: null,
          sortdir: null,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error fetching group list: ${error}`, true);
      }
    },
  );

  // ── Get Group Details ────────────────────────────────────────────────
  server.tool(
    "get_group",
    "Get detailed information about a specific group",
    {
      name: z.string().describe("Group name to look up"),
    },
    async ({ name }) => {
      try {
        const result = await client.rpc("GroupMgmt", "get", { name });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching group '${name}': ${error}`,
          true,
        );
      }
    },
  );

  // ── Enumerate Users ──────────────────────────────────────────────────
  server.tool(
    "enumerate_users",
    "Enumerate all system users including system accounts (broader than list_users which may only show OMV-managed accounts)",
    {},
    async () => {
      try {
        const result = await client.rpc("UserMgmt", "enumerateUsers", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error enumerating users: ${error}`, true);
      }
    },
  );

  // ── Enumerate Groups ─────────────────────────────────────────────────
  server.tool(
    "enumerate_groups",
    "Enumerate all system groups including system groups",
    {},
    async () => {
      try {
        const result = await client.rpc("GroupMgmt", "enumerateGroups", {});
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(`Error enumerating groups: ${error}`, true);
      }
    },
  );

  // ── Get User Privileges (by shared folder) ───────────────────────────
  server.tool(
    "get_user_privileges",
    "Get all shared folder privileges assigned to a specific user",
    {
      name: z
        .string()
        .describe("Username to get privileges for"),
    },
    async ({ name }) => {
      try {
        const result = await client.rpc("ShareMgmt", "getPrivilegesByRole", {
          role: "user",
          name,
        });
        return toolResult(JSON.stringify(result, null, 2));
      } catch (error) {
        return toolResult(
          `Error fetching privileges for user '${name}': ${error}`,
          true,
        );
      }
    },
  );
}
