import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createMarketingTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_marketing",
    `Bitrix24 marketing: segments from CRM, broadcast send, lead filtering, trade platforms. Methods crm.lead.list (filters), mail.message.send, sale.tradePlatform.* (${API_VERSION}). RU/EN: сегмент, рассылка, маркетинг, источник лидов, площадка / segment, broadcast, marketing, lead source, trade platform.`,
    ["segment_create", "segment_add_leads", "segment_list", "broadcast_send", "lead_filter", "tradeplatform_list"],
    {
      name: P.name, segmentId: { type: "string", description: "Segment ID" },
      leadIds: { type: "array", items: { type: "string" }, description: "Lead IDs" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      mailFields: { type: "object", description: "Mail send fields: TO, SUBJECT, BODY" },
    },
    {
      segment_create: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      segment_add_leads: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select"] },
      segment_list: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      broadcast_send: { restMethod: "mail.message.send", httpVerb: "POST", bodyParam: "mailFields", bodyWrapper: "fields" },
      lead_filter: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      tradeplatform_list: { restMethod: "sale.tradePlatform.list", httpVerb: "GET", isList: true },
    },
    client,
    {
      segment_create: "Build a segment from CRM leads by filter",
      segment_add_leads: "Resolve lead IDs for a segment by filter",
      segment_list: "List leads matching a segment filter",
      broadcast_send: "Send a broadcast email (mail.message.send)",
      lead_filter: "Filter leads for marketing",
      tradeplatform_list: "List trade platforms",
    },
  );
}