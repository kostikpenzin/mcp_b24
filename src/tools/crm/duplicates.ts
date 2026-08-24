import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDuplicatesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_duplicates",
    `Bitrix24 CRM duplicate search & merge. Methods crm.duplicate.*, crm.entity.mergeBatch (${API_VERSION}). RU/EN: дубли, найти дубли, объединить / duplicates, find duplicates, merge.`,
    ["findbycomm", "findbyfields", "merge", "mergeBatch", "volatileType_fields", "volatileType_list", "volatileType_register", "volatileType_unregister", "status_list", "status_get", "status_add", "status_update", "status_delete", "status_fields", "status_entity_items", "status_entity_types"],
    {
      type: { type: "string", enum: ["email", "phone"], description: "Communication type for findbycomm" },
      values: { type: "array", items: { type: "string" }, description: "Communication values (emails or phones)" },
      entity: { type: "string", enum: ["lead", "contact", "company"], description: "Entity type for findbyfields/merge" },
      fields: { type: "object", description: "Fields to match for findbyfields (e.g. NAME, LAST_NAME, EMAIL)" },
      mainId: P.id, otherIds: { type: "array", items: { type: "string" }, description: "IDs to merge into mainId" },
      statusId: { type: "string", description: "CRM status ID (crm.status.* / dictionaries)" },
      statusEntityId: { type: "string", description: "Status entity ID (e.g. STATUS, SOURCE)" },
      statusFields: { type: "object", description: "Status element fields: NAME, STATUS_ID, SORT, COLOR" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      findbycomm: { restMethod: "crm.duplicate.findbycomm", httpVerb: "GET", queryParams: ["type", "values"] },
      findbyfields: { restMethod: "crm.duplicate.findbyfields", httpVerb: "GET", queryParams: ["entity", "fields"] },
      merge: { restMethod: "crm.entity.merge", httpVerb: "POST", pathParams: ["mainId"], bodyParam: "otherIds", bodyWrapper: "otherIds" },
      mergeBatch: { restMethod: "crm.entity.mergeBatch", httpVerb: "POST", bodyParam: "otherIds", bodyWrapper: "params", destructive: true },
      volatileType_fields: { restMethod: "crm.duplicate.volatileType.fields", httpVerb: "GET" },
      volatileType_list: { restMethod: "crm.duplicate.volatileType.list", httpVerb: "GET", isList: true },
      volatileType_register: { restMethod: "crm.duplicate.volatileType.register", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      volatileType_unregister: { restMethod: "crm.duplicate.volatileType.unregister", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      status_list: { restMethod: "crm.status.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      status_get: { restMethod: "crm.status.get", httpVerb: "GET", pathParams: ["statusId"] },
      status_add: { restMethod: "crm.status.add", httpVerb: "POST", bodyParam: "statusFields", bodyWrapper: "fields" },
      status_update: { restMethod: "crm.status.update", httpVerb: "POST", pathParams: ["statusId"], bodyParam: "statusFields", bodyWrapper: "fields" },
      status_delete: { restMethod: "crm.status.delete", httpVerb: "POST", pathParams: ["statusId"] },
      status_fields: { restMethod: "crm.status.fields", httpVerb: "GET" },
      status_entity_items: { restMethod: "crm.status.entity.items", httpVerb: "GET", pathParams: ["statusEntityId"] },
      status_entity_types: { restMethod: "crm.status.entity.types", httpVerb: "GET" },
    },
    client,
    {
      findbycomm: "Find duplicates by communication (email/phone)",
      findbyfields: "Find duplicates by matching fields",
      merge: "Merge entities by ID (mainId absorbs otherIds) — destructive",
      mergeBatch: "Batch-merge duplicates — destructive, irreversible",
      volatileType_fields: "Describe volatile duplicate type fields",
      volatileType_list: "List volatile duplicate types",
      volatileType_register: "Register a volatile duplicate type",
      volatileType_unregister: "Unregister a volatile duplicate type (destructive)",
      status_list: "List CRM status/dictionary elements (stages, sources, ...)",
      status_get: "Get a status element by ID", status_add: "Create a status element",
      status_update: "Update a status element", status_delete: "Delete a status element (destructive)",
      status_fields: "Describe status fields", status_entity_items: "Get status items by entity ID",
      status_entity_types: "List status entity types",
    },
  );
}