import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createOpenLinesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_openlines",
    `Bitrix24 IM open lines (открытые линии): configs, sessions, dialogs, operators, CRM links, network. Methods imopenlines.* (${API_VERSION}). RU/EN: открытая линия, линия поддержки, сессия, оператор, диалог / open line, support line, session, operator, dialog.`,
    [
      "config_get", "config_list", "config_add", "config_update",
      "session_open", "session_history_get", "dialog_get",
      "network_join", "operator_answer", "message_quick_save",
      "crm_lead_create", "crm_message_add",
    ],
    {
      id: P.lineId,
      sessionId: P.sessionId,
      dialogId: P.dialogId,
      fields: { type: "object", description: "Line/session/CRM fields (per Bitrix24 docs for the method)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      message: { type: "string", description: "Message text for quick save / CRM message" },
      chatId: P.chatId,
    },
    {
      config_get: { restMethod: "imopenlines.config.get", httpVerb: "GET", pathParams: ["id"] },
      config_list: { restMethod: "imopenlines.config.list.get", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      config_add: { restMethod: "imopenlines.config.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      config_update: { restMethod: "imopenlines.config.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      session_open: { restMethod: "imopenlines.session.open", httpVerb: "POST", pathParams: ["sessionId"] },
      session_history_get: { restMethod: "imopenlines.session.history.get", httpVerb: "GET", pathParams: ["sessionId"], queryParams: ["filter", "select", "order", "start"] },
      dialog_get: { restMethod: "imopenlines.dialog.get", httpVerb: "GET", pathParams: ["dialogId"] },
      network_join: { restMethod: "imopenlines.network.join", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      operator_answer: { restMethod: "imopenlines.operator.answer", httpVerb: "POST", pathParams: ["dialogId"] },
      message_quick_save: { restMethod: "imopenlines.message.quick.save", httpVerb: "POST", bodyParam: "message", bodyWrapper: "fields" },
      crm_lead_create: { restMethod: "imopenlines.crm.lead.create", httpVerb: "POST", pathParams: ["dialogId"], bodyParam: "fields", bodyWrapper: "fields" },
      crm_message_add: { restMethod: "imopenlines.crm.message.add", httpVerb: "POST", bodyParam: "message", bodyWrapper: "fields" },
    },
    client,
    {
      config_get: "Get an open line config", config_list: "List open line configs",
      config_add: "Create an open line", config_update: "Update an open line config",
      session_open: "Open an open-line session", session_history_get: "Get session message history",
      dialog_get: "Get open-line dialog data",
      network_join: "Join an external Bitrix24 network line",
      operator_answer: "Operator answers a dialog (claim the conversation)",
      message_quick_save: "Save a quick reply template",
      crm_lead_create: "Create a CRM lead from an open-line dialog",
      crm_message_add: "Send a CRM-linked message",
    },
  );
}