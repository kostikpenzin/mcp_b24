import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createReportsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_reports",
    `Bitrix24 analytics & reports: deal pipeline, lead sources, user activity, task completion, deal conversion, funnel stages. Methods crm.deal.list, crm.status.*, crm.lead.list, tasks.task.list aggregations (${API_VERSION}). RU/EN: отчёт, аналитика, воронка, конверсия, источник, активность / report, analytics, pipeline, conversion, source, activity.`,
    ["deal_pipeline", "lead_source", "user_activity", "task_completion", "deal_conversion", "funnel_stages"],
    {
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      categoryId: { type: "string", description: "Pipeline/category ID for deal reports" },
    },
    {
      deal_pipeline: { restMethod: "crm.deal.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      lead_source: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      user_activity: { restMethod: "crm.activity.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      task_completion: { restMethod: "tasks.task.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      deal_conversion: { restMethod: "crm.deal.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      funnel_stages: { restMethod: "crm.status.list", httpVerb: "GET" },
    },
    client,
    {
      deal_pipeline: "Deals by stage for pipeline analysis", lead_source: "Leads grouped by source",
      user_activity: "User activities (calls/meetings)", task_completion: "Task completion stats",
      deal_conversion: "Deal conversion analysis", funnel_stages: "Funnel stage names (crm.status.list)",
    },
  );
}