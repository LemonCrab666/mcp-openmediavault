
import { OmvClient } from "../omv-client.js";

export function registerUserTools(
  server: any,
  client: OmvClient,
): void {
  server.tool(
    "list_users",
    "List all system users",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.getList("UserMgmt", "getUserList", {});
        } else {
          result = await client.getList("UserMgmt", "getList", {});
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
              text: "Error listing users: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_user",
    "Get details of a specific user",
    {
      username: {
        type: "string",
        description: "The username",
        required: true,
      },
    },
    async (args: any) => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("UserMgmt", "getUser", { name: args.username });
        } else {
          result = await client.rpc("UserMgmt", "get", { name: args.username });
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
              text: "Error getting user: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "list_groups",
    "List all system groups",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.getList("UserMgmt", "getGroupList", {});
        } else {
          result = await client.getList("GroupMgmt", "getList", {});
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
              text: "Error listing groups: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "get_group",
    "Get details of a specific group",
    {
      groupname: {
        type: "string",
        description: "The group name",
        required: true,
      },
    },
    async (args: any) => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("UserMgmt", "getGroup", { name: args.groupname });
        } else {
          result = await client.rpc("GroupMgmt", "get", { name: args.groupname });
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
              text: "Error getting group: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "enumerate_local_users",
    "Enumerate all local system users (including system users)",
    {},
    async () => {
      try {
        const result = await client.rpc("UserMgmt", "enumerateUsers", {});
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
              text: "Error enumerating users: " + error.message,
            },
          ],
        };
      }
    },
  );

  server.tool(
    "enumerate_local_groups",
    "Enumerate all local system groups (including system groups)",
    {},
    async () => {
      try {
        let result;
        if (client.omvVersion === "omv8") {
          result = await client.rpc("UserMgmt", "enumerateGroups", {});
        } else {
          result = await client.rpc("GroupMgmt", "enumerateGroups", {});
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
              text: "Error enumerating groups: " + error.message,
            },
          ],
        };
      }
    },
  );
}
