import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createStageHistoryTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_stagehistory",
    `Bitrix24 CRM stage history (история перемещений по стадиям): list, get, fields. Methods crm.stagehistory.* (${API_VERSION}). RU/EN: история стадий, движение по воронке, история сделки / stage history, funnel movement, deal history.`,
    ["list", "get", "fields"],
    {
      id: P.id,
      fields: { type: "object", description: "Stage history record fields (per Bitrix24 docs)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      list: { restMethod: "crm.stagehistory.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      get: { restMethod: "crm.stagehistory.get", httpVerb: "GET", pathParams: ["id"] },
      fields: { restMethod: "crm.stagehistory.fields", httpVerb: "GET" },
    },
    client,
    {
      list: "List stage movement history (filter by ENTITY_TYPE/RECORD_ID)",
      get: "Get a stage history record by ID", fields: "Describe stage history fields",
    },
  );
}