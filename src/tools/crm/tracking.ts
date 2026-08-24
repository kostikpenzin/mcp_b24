import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createTrackingTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_tracking",
    `Bitrix24 CRM tracking (отслеживание источников): traces, sources, channels. Methods crm.tracking.trace.*, crm.tracking.source.*, crm.tracking.channel.* (${API_VERSION}). RU/EN: отслеживание, источник, трекинг, UTM, канал / tracking, source, UTM, channel, trace.`,
    ["trace_add", "trace_get", "trace_list", "trace_delete", "source_add", "source_get", "source_list", "source_update", "source_delete", "channel_list"],
    {
      id: P.traceId,
      sourceId: P.sourceId,
      fields: { type: "object", description: "Trace/source fields (per Bitrix24 docs for the method)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      trace_add: { restMethod: "crm.tracking.trace.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      trace_get: { restMethod: "crm.tracking.trace.get", httpVerb: "GET", pathParams: ["id"] },
      trace_list: { restMethod: "crm.tracking.trace.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      trace_delete: { restMethod: "crm.tracking.trace.delete", httpVerb: "POST", pathParams: ["id"] },
      source_add: { restMethod: "crm.tracking.source.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      source_get: { restMethod: "crm.tracking.source.get", httpVerb: "GET", pathParams: ["sourceId"] },
      source_list: { restMethod: "crm.tracking.source.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      source_update: { restMethod: "crm.tracking.source.update", httpVerb: "POST", pathParams: ["sourceId"], bodyParam: "fields", bodyWrapper: "fields" },
      source_delete: { restMethod: "crm.tracking.source.delete", httpVerb: "POST", pathParams: ["sourceId"] },
      channel_list: { restMethod: "crm.tracking.channel.list", httpVerb: "GET", isList: true },
    },
    client,
    {
      trace_add: "Add a tracking trace (UTM/visit record)", trace_get: "Get a trace by ID",
      trace_list: "List tracking traces", trace_delete: "Delete a trace (destructive)",
      source_add: "Add a tracking source (UTM source)", source_get: "Get a tracking source",
      source_list: "List tracking sources", source_update: "Update a tracking source",
      source_delete: "Delete a tracking source (destructive)", channel_list: "List tracking channels",
    },
  );
}