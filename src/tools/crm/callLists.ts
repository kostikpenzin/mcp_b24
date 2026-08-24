import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createCallListsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_calllists",
    `Bitrix24 CRM call lists (списки обзвона): create, list, get, delete, start, status. Methods crm.calllist.* (${API_VERSION}). RU/EN: список обзвона, обзвон, прозвон / call list, cold call list, dial list.`,
    ["add", "get", "list", "delete", "start", "status"],
    {
      id: P.callListId,
      fields: { type: "object", description: "Call list fields: NAME, ENTITY_TYPE (LEAD/CONTACT), ..." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      add: { restMethod: "crm.calllist.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.calllist.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.calllist.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      delete: { restMethod: "crm.calllist.delete", httpVerb: "POST", pathParams: ["id"] },
      start: { restMethod: "crm.calllist.start", httpVerb: "POST", pathParams: ["id"] },
      status: { restMethod: "crm.calllist.status", httpVerb: "GET", pathParams: ["id"] },
    },
    client,
    {
      add: "Create a call list", get: "Get a call list by ID", list: "List call lists",
      delete: "Delete a call list (destructive)", start: "Start dialing a call list", status: "Get call list execution status",
    },
  );
}