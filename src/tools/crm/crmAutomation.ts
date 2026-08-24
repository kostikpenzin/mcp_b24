import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createCrmAutomationTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_automation",
    `Bitrix24 CRM automation triggers (триггеры автоматизации): app triggers, execute, webhook trigger. Methods crm.automation.trigger.* (${API_VERSION}). RU/EN: автоматизация, триггер, запустить триггер, робот / automation, trigger, execute trigger, robot.`,
    ["trigger", "trigger_add", "trigger_list", "trigger_execute", "trigger_delete"],
    {
      id: P.triggerId,
      code: { type: "string", description: "Trigger code (DEAL, LEAD, etc.) for trigger" },
      fields: { type: "object", description: "Trigger fields: CODE, NAME, ..." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      trigger: { restMethod: "crm.automation.trigger", httpVerb: "POST", bodyParam: "code", bodyWrapper: "code" },
      trigger_add: { restMethod: "crm.automation.trigger.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      trigger_list: { restMethod: "crm.automation.trigger.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      trigger_execute: { restMethod: "crm.automation.trigger.execute", httpVerb: "POST", pathParams: ["id"] },
      trigger_delete: { restMethod: "crm.automation.trigger.delete", httpVerb: "POST", pathParams: ["id"] },
    },
    client,
    {
      trigger: "Fire a configured webhook trigger (by code)",
      trigger_add: "Register an app automation trigger",
      trigger_list: "List app automation triggers",
      trigger_execute: "Execute an app automation trigger by ID",
      trigger_delete: "Delete an app automation trigger (destructive)",
    },
  );
}