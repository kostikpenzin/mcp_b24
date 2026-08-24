import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDepartmentsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_departments",
    `Bitrix24 departments (org structure): CRUD + IM dept info. Methods department.*, im.department.* (${API_VERSION}). RU/EN: отдел, подразделение, оргструктура, найти отдел / department, org structure, find department.`,
    ["get", "list", "add", "update", "delete", "get_all", "fields", "im_get"],
    {
      id: P.id, fields: { type: "object", description: "Department fields: NAME, PARENT, SORT, UF_HEAD" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      get: { restMethod: "department.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "department.get", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order"] },
      add: { restMethod: "department.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      update: { restMethod: "department.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "department.delete", httpVerb: "POST", pathParams: ["id"] },
      get_all: { restMethod: "department.fields", httpVerb: "GET" },
      fields: { restMethod: "department.fields", httpVerb: "GET" },
      im_get: { restMethod: "im.department.get", httpVerb: "GET", pathParams: ["id"] },
    },
    client,
    {
      get: "Get a department by ID", list: "List/filter departments", add: "Create a department",
      update: "Update a department", delete: "Delete a department (destructive)",
      get_all: "Describe department fields", fields: "Describe department fields",
      im_get: "Get IM info for a department",
    },
  );
}