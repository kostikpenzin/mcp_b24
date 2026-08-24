import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createTimeTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_time",
    `Bitrix24 working time tracking (timeman). Methods timeman.*, timeman.status.* (${API_VERSION}). RU/EN: учёт рабочего времени, открыть день, закрыть день, пауза, перерыв / working time, open day, close day, pause, break.`,
    ["status_open", "status_close", "status_pause", "status_get", "status_update", "time_settings", "timecontrol_report_add", "timecontrol_reports_get", "timecontrol_settings_get", "timecontrol_settings_set", "timecontrol_reports_settings_get", "timecontrol_reports_users_get", "networkrange_get", "networkrange_set", "networkrange_check", "schedule_get", "record_list", "record_field_list", "record_field_get"],
    {
      userId: P.userId,
      report: { type: "string", description: "Report text for close" },
      timeFields: { type: "object", description: "Time fields: TIME_START, TIME_END, DATE_START" },
      reportFields: { type: "object", description: "Absence report fields: ACTIVE_FROM, ACTIVE_TO, REPORT_DATE, REASON, COMMENT" },
      settingsFields: { type: "object", description: "Time control settings" },
      networkFields: { type: "object", description: "Office network range fields: IP_RANGE, ..." },
      scheduleId: { type: "string", description: "Schedule ID" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      status_open: { restMethod: "timeman.open", httpVerb: "GET", queryParams: ["userId"] },
      status_close: { restMethod: "timeman.close", httpVerb: "POST", queryParams: ["userId", "report"] },
      status_pause: { restMethod: "timeman.pause", httpVerb: "POST", queryParams: ["userId"] },
      status_get: { restMethod: "timeman.status", httpVerb: "GET", queryParams: ["userId"] },
      status_update: { restMethod: "timeman.time", httpVerb: "POST", bodyParam: "timeFields", bodyWrapper: "fields" },
      time_settings: { restMethod: "timeman.time.settings", httpVerb: "GET", queryParams: ["userId"] },
      timecontrol_report_add: { restMethod: "timeman.timecontrol.report.add", httpVerb: "POST", bodyParam: "reportFields", bodyWrapper: "fields" },
      timecontrol_reports_get: { restMethod: "timeman.timecontrol.reports.get", httpVerb: "GET", queryParams: ["filter", "select", "order", "start"] },
      timecontrol_settings_get: { restMethod: "timeman.timecontrol.settings.get", httpVerb: "GET" },
      timecontrol_settings_set: { restMethod: "timeman.timecontrol.settings.set", httpVerb: "POST", bodyParam: "settingsFields", bodyWrapper: "fields" },
      timecontrol_reports_settings_get: { restMethod: "timeman.timecontrol.reports.settings.get", httpVerb: "GET" },
      timecontrol_reports_users_get: { restMethod: "timeman.timecontrol.reports.users.get", httpVerb: "GET", queryParams: ["filter", "select", "order", "start"] },
      networkrange_get: { restMethod: "timeman.networkrange.get", httpVerb: "GET" },
      networkrange_set: { restMethod: "timeman.networkrange.set", httpVerb: "POST", bodyParam: "networkFields", bodyWrapper: "fields" },
      networkrange_check: { restMethod: "timeman.networkrange.check", httpVerb: "GET" },
      schedule_get: { restMethod: "timeman.schedule.get", httpVerb: "GET", pathParams: ["scheduleId"] },
      record_list: { restMethod: "timeman.record.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      record_field_list: { restMethod: "timeman.record.field.list", httpVerb: "GET" },
      record_field_get: { restMethod: "timeman.record.field.get", httpVerb: "GET" },
    },
    client,
    {
      status_open: "Open the working day", status_close: "Close the working day (optionally with report)",
      status_pause: "Pause the working day", status_get: "Get current working-day status",
      status_update: "Update working time (TIME_START/TIME_END/DATE_START)",
      time_settings: "Get working time settings",
      timecontrol_report_add: "Submit an absence report", timecontrol_reports_get: "Get absence reports",
      timecontrol_settings_get: "Get time control settings", timecontrol_settings_set: "Set time control settings",
      timecontrol_reports_settings_get: "Get reports UI settings", timecontrol_reports_users_get: "Get department users for reports",
      networkrange_get: "Get office IP ranges", networkrange_set: "Set office IP ranges",
      networkrange_check: "Check whether an IP is in the office network",
      schedule_get: "Get a work schedule by ID",
      record_list: "List time records", record_field_list: "List time record fields", record_field_get: "Get a time record field",
    },
  );
}