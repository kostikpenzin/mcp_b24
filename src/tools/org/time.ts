import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createTimeTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_time",
    `Bitrix24 working time tracking (timeman). Methods timeman.*, timeman.status.* (${API_VERSION}). RU/EN: учёт рабочего времени, открыть день, закрыть день, пауза, перерыв / working time, open day, close day, pause, break.`,
    ["status_open", "status_close", "status_pause", "status_get", "status_update", "time_settings"],
    {
      userId: P.userId,
      report: { type: "string", description: "Report text for close" },
      timeFields: { type: "object", description: "Time fields: TIME_START, TIME_END, DATE_START" },
    },
    {
      status_open: { restMethod: "timeman.open", httpVerb: "GET", queryParams: ["userId"] },
      status_close: { restMethod: "timeman.close", httpVerb: "POST", queryParams: ["userId", "report"] },
      status_pause: { restMethod: "timeman.pause", httpVerb: "POST", queryParams: ["userId"] },
      status_get: { restMethod: "timeman.status", httpVerb: "GET", queryParams: ["userId"] },
      status_update: { restMethod: "timeman.time", httpVerb: "POST", bodyParam: "timeFields", bodyWrapper: "fields" },
      time_settings: { restMethod: "timeman.time.settings", httpVerb: "GET", queryParams: ["userId"] },
    },
    client,
    {
      status_open: "Open the working day", status_close: "Close the working day (optionally with report)",
      status_pause: "Pause the working day", status_get: "Get current working-day status",
      status_update: "Update working time (TIME_START/TIME_END/DATE_START)",
      time_settings: "Get working time settings",
    },
  );
}