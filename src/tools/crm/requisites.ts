import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createRequisitesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_requisites",
    `Bitrix24 CRM requisites (реквизиты) + presets + links: CRUD. Methods crm.requisite.*, crm.requisite.preset.*, crm.requisite.link.* (${API_VERSION}). RU/EN: реквизиты, добавить реквизиты компании, пресет, привязка / requisites, company details, preset, link.`,
    ["add", "get", "list", "update", "delete", "preset_list", "preset_get", "link_add"],
    {
      id: P.id, fields: { type: "object", description: "Requisite fields: ENTITY_TYPE_ID, ENTITY_ID, PRESET_ID, NAME, RQ_INN, RQ_KPP, RQ_COMPANY_NAME, RQ_ADDRESS." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      presetId: { type: "string", description: "Requisite preset ID" },
      linkFields: { type: "object", description: "Link fields: ENTITY_TYPE_ID, ENTITY_ID, REQUISITE_ID" },
    },
    {
      add: { restMethod: "crm.requisite.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.requisite.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.requisite.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.requisite.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.requisite.delete", httpVerb: "POST", pathParams: ["id"] },
      preset_list: { restMethod: "crm.requisite.preset.list", httpVerb: "GET" },
      preset_get: { restMethod: "crm.requisite.preset.get", httpVerb: "GET", pathParams: ["presetId"] },
      link_add: { restMethod: "crm.requisite.link.add", httpVerb: "POST", bodyParam: "linkFields", bodyWrapper: "fields" },
    },
    client,
    {
      add: "Create requisite (INN/KPP/etc.) for a company/contact", get: "Get a requisite by ID",
      list: "List requisites", update: "Update requisite fields", delete: "Delete a requisite (destructive)",
      preset_list: "List requisite presets", preset_get: "Get a preset by ID",
      link_add: "Link a requisite to an entity",
    },
  );
}