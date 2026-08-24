import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createUsersTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_users",
    `Bitrix24 portal users: current, get, search, list by department, user fields, user CRUD. Methods user.*, user.userfield.* (${API_VERSION}). RU/EN: пользователь, кто я, найти сотрудника, отдел, пригласить / user, who am i, find user, invite.`,
    ["current", "get", "listByDepartment", "search", "fields", "userfield_get", "userfield_list", "userfield_add", "userfield_update", "userfield_delete", "add", "update", "delete"],
    {
      ID: { type: "string", description: "User ID (single or array for user.get)" },
      FILTER: { type: "object", description: "Search/filter: NAME, LAST_NAME, EMAIL, UF_DEPARTMENT, ACTIVE" },
      departmentId: { type: "string", description: "Department ID" },
      userfieldId: P.userfieldId,
      userfield: { type: "object", description: "User field definition: FIELD_NAME, USER_TYPE_ID, LABEL" },
      fields: { type: "object", description: "User fields: NAME, LAST_NAME, EMAIL, ACTIVE, UF_DEPARTMENT_ID, PERSONAL_PHONE, WORK_POSITION" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      current: { restMethod: "user.current", httpVerb: "GET" },
      get: { restMethod: "user.get", httpVerb: "POST", bodyParam: "ID", bodyWrapper: "ID" },
      listByDepartment: { restMethod: "user.get", httpVerb: "POST", bodyParam: "ID", bodyWrapper: "ID" },
      search: { restMethod: "user.search", httpVerb: "POST", bodyParam: "FILTER", bodyWrapper: "FILTER" },
      fields: { restMethod: "user.fields", httpVerb: "GET" },
      userfield_get: { restMethod: "user.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_list: { restMethod: "user.userfield.list", httpVerb: "GET" },
      userfield_add: { restMethod: "user.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "user.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "user.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
      add: { restMethod: "user.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      update: { restMethod: "user.update", httpVerb: "POST", pathParams: ["ID"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "user.delete", httpVerb: "POST", pathParams: ["ID"] },
    },
    client,
    {
      current: "Get the current authenticated user", get: "Get user(s) by ID",
      listByDepartment: "List users of a department (pass department user IDs via ID)",
      search: "Search users (FILTER: NAME/EMAIL/UF_DEPARTMENT/ACTIVE)", fields: "Describe user fields",
      userfield_get: "Get a custom user field", userfield_list: "List custom user fields", userfield_add: "Create a custom user field",
      userfield_update: "Update a custom user field", userfield_delete: "Delete a custom user field (destructive)",
      add: "Invite/add a new user (destructive — creates account)", update: "Update a user",
      delete: "Delete a user (destructive)",
    },
  );
}