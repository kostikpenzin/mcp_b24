import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDuplicatesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_duplicates",
    `Bitrix24 CRM duplicate search & merge. Methods crm.duplicate.*, crm.entity.mergeBatch (${API_VERSION}). RU/EN: дубли, найти дубли, объединить / duplicates, find duplicates, merge.`,
    ["findbycomm", "findbyfields", "merge", "mergeBatch"],
    {
      type: { type: "string", enum: ["email", "phone"], description: "Communication type for findbycomm" },
      values: { type: "array", items: { type: "string" }, description: "Communication values (emails or phones)" },
      entity: { type: "string", enum: ["lead", "contact", "company"], description: "Entity type for findbyfields/merge" },
      fields: { type: "object", description: "Fields to match for findbyfields (e.g. NAME, LAST_NAME, EMAIL)" },
      mainId: P.id, otherIds: { type: "array", items: { type: "string" }, description: "IDs to merge into mainId" },
    },
    {
      findbycomm: { restMethod: "crm.duplicate.findbycomm", httpVerb: "GET", queryParams: ["type", "values"] },
      findbyfields: { restMethod: "crm.duplicate.findbyfields", httpVerb: "GET", queryParams: ["entity", "fields"] },
      merge: { restMethod: "crm.entity.merge", httpVerb: "POST", pathParams: ["mainId"], bodyParam: "otherIds", bodyWrapper: "otherIds" },
      mergeBatch: { restMethod: "crm.entity.mergeBatch", httpVerb: "POST", bodyParam: "otherIds", bodyWrapper: "params", destructive: true },
    },
    client,
    {
      findbycomm: "Find duplicates by communication (email/phone)",
      findbyfields: "Find duplicates by matching fields",
      merge: "Merge entities by ID (mainId absorbs otherIds) — destructive",
      mergeBatch: "Batch-merge duplicates — destructive, irreversible",
    },
  );
}