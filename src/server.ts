import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Bitrix24Config, ToolDefinition } from "./types.js";
import { Bitrix24ApiClient } from "./api-client.js";
import { getAllTools, NON_ACTION_TOOLS } from "./tools/index.js";
import { Bitrix24ApiError, errorResult, apiErrorResult } from "./error.js";
import { VERSION, API_VERSION } from "./constants.js";

export function buildInstructions(): string {
  return (
    "Bitrix24 MCP server (mcp-b24). Executes real REST calls against a Bitrix24 portal across CRM, " +
    "tasks, chats, files, calendar, HR, smart processes, mail, telephony, workflows, events, " +
    "open lines, chat bots, document generator, quotes, currency, webforms, tracking, inventory. " +
    `Wraps Bitrix24 REST (${API_VERSION}). Auth handled automatically via webhook (BX24_WEBHOOK_URL) or OAuth 2.0 (BX24_DOMAIN + client credentials, auto-refresh). The AI agent never sees credentials.\n\n` +
    "Most tools are action-based: each groups a REST domain and selects the operation with an `action` parameter.\n\n" +
    "NATURAL LANGUAGE MAPPING (RU/EN → tool + action):\n\n" +
    "CRM:\n" +
    "  - bx24_crm_leads: add/get/list/update/delete/fields/contact_*/userfield_*/convert/productrows_*/details_* (лиды/leads)\n" +
    "  - bx24_crm_deals: add/get/list/update/delete/fields/category_*/productrows/contact_*/recurring_*/details_*/userfield_* (сделки/deals + воронки)\n" +
    "  - bx24_crm_contacts: add/get/list/update/delete/fields/company_*/userfield_*/details_* (контакты)\n" +
    "  - bx24_crm_companies: add/get/list/update/delete/fields/contact_*/userfield_*/details_* (компании)\n" +
    "  - bx24_crm_invoices: add/get/list/update/delete/fields/stage_list/*ProductRows (счета/SMART_INVOICE, entityTypeId=31 auto)\n" +
    "  - bx24_crm_products: product/section/price/store/priceType/measure/vat/ratio/roundingRule/extra/storeProduct/document_*/property_*/offer/sku/service_* (торговый каталог/склад)\n" +
    "  - bx24_crm_activities: add/get/list/update/delete/fields/complete/todo_*/configurable_*/type_*/badge_*/timeline_*/binding_*/count (дела/звонки/встречи + таймлайн)\n" +
    "  - bx24_crm_requisites: add/get/list/update/delete/preset_*/bankdetail_*/link_*/userfield_* (реквизиты + банк.реквизиты)\n" +
    "  - bx24_crm_duplicates: findbycomm/findbyfields/merge/mergeBatch/volatileType_*/status_* (дубли + справочники)\n" +
    "  - bx24_smart_processes: type_*/item_* (умные процессы; item_* require typeId)\n" +
    "  - bx24_crm_quotes: add/get/list/update/delete/fields/productrows_*/contact_*/userfield_* (коммерческие предложения/quotes)\n" +
    "  - bx24_crm_documents: template_*/document_*/binding_*/numerator_*/region_list/provider_list (генератор документов/document generator)\n" +
    "  - bx24_crm_currency: add/get/list/update/delete/fields/base_*/localizations_* (валюты/currencies)\n" +
    "  - bx24_crm_webform: add/get/list/update/delete/fields/result_*/option_* (веб-формы/webforms)\n" +
    "  - bx24_crm_tracking: trace_*/source_*/channel_list (отслеживание/tracking sources)\n" +
    "  - bx24_crm_automation: trigger/trigger_add/list/execute/delete (триггеры автоматизации)\n" +
    "  - bx24_crm_calllists: add/get/list/delete/start/status (списки обзвона/call lists)\n" +
    "  - bx24_crm_addresses: add/get/list/update/delete/fields/byclient/deleteByFilter (адреса/addresses)\n" +
    "  - bx24_crm_stagehistory: list/get/fields (история стадий/stage history)\n\n" +
    "TASKS & COLLAB:\n" +
    "  - bx24_tasks: full lifecycle + checklists + comments + elapsed + flows + stages + planner + dependence + userfield_* (задачи)\n" +
    "  - bx24_projects: create/get/list/update/delete/user_*/set_owner/feature_*/subject_* (проекты/группы)\n" +
    "  - bx24_disk: storage_*/folder_*/file_* + versions + external links + shareToUser + rights + attachedObject (Диск)\n" +
    "  - bx24_im: message_*/notify_*/user_*/search_*/counters_get/recent_*/dialog_*/department_*/v2_*/bot_list (мессенджер)\n" +
    "  - bx24_im_chat: add/get/update*/setOwner/setManager/user_*/leave/mute/sendMessage/editMessage/deleteMessage/searchMessages/readAll/uploadFile (чаты)\n" +
    "  - bx24_conf: create/get/list/delete/join/leave (конференции)\n" +
    "  - bx24_calendar: event_*/section_*/meeting_status_*/resource_*/accessibility_get/settings_get/set (календарь)\n" +
    "  - bx24_openlines: config_*/session_*/dialog_get/network_join/operator_answer/message_quick_save/crm_* (открытые линии/open lines)\n" +
    "  - bx24_bots: bot_*/chat_*/message_*/reaction_*/command_*/file_*/event_get (чат-боты v2/chat bots)\n\n" +
    "ORG:\n" +
    "  - bx24_users: current/get/listByDepartment/search/fields/userfield_*/add/update/delete (пользователи)\n" +
    "  - bx24_departments: get/list/add/update/delete/fields/im_get (отделы/оргструктура)\n" +
    "  - bx24_time: status_* + time_settings + timecontrol_*/networkrange_*/schedule_get/record_* (учёт времени + time control)\n" +
    "  - bx24_hr: employee_*/invite/dismiss/transfer/info (HR/кадры)\n\n" +
    "BIZ:\n" +
    "  - bx24_lists: list_*/field_*/element_*/section_*/field_type_get (универсальные списки)\n" +
    "  - bx24_mail: mailbox_*/message_*/recipient_*/mailservice_*/filter_*/message_mark + message_movetofolder/createtask/createcalendarevent/createchat/createcrmactivity (почта)\n" +
    "  - bx24_reports: deal_pipeline/lead_source/user_activity/task_completion/deal_conversion/funnel_stages (аналитика)\n" +
    "  - bx24_marketing: segment_*/broadcast_send/lead_filter/tradeplatform_list (маркетинг)\n" +
    "  - bx24_workflows: template_*/start/kill/workflow_terminate/task_*/robot_*/activity_*/event_send/instance_* (бизнес-процессы + CRUD роботов/активностей)\n" +
    "  - bx24_telephony: externalLine_*/externalCall_*/sip_*/call_followup_get/voximplant_* (телефония + callback/infocall/TTS/lines/stats)\n" +
    "  - bx24_events: bind/unbind/get/offline_*/get_supported/events_list (события/подписки)\n\n" +
    "GENERIC:\n" +
    "  - bx24_batch: combine up to 50 REST calls; reference earlier results via $result[key]\n" +
    "  - bx24_call: invoke ANY Bitrix24 REST method by name with arbitrary params (escape-hatch)\n" +
    "  - bx24_crm_summary: CRM overview — total counts of leads/deals/contacts/companies + lead statuses + deal funnels in one call (сводка CRM)\n" +
    "  - bx24_health: verify API connectivity, credentials, and response time (проверка подключения)\n\n" +
    "CONVENTIONS:\n" +
    "- CRM IDs are strings. List actions support filter/select/order/start. Call action=fields FIRST when unsure which fields an entity supports.\n" +
    "- Bitrix24 returns errors inside a 200 response with an `error` field; surfaced as tool errors with the `reason` code.\n" +
    "- Rate limits: token-bucket honours BX24_RATE_LIMIT_RPS; 503 QUERY_LIMIT_EXCEEDED and 429 OPERATION_TIME_LIMIT are retried with backoff.\n" +
    "- DESTRUCTIVE ACTION CONFIRMATION: when BX24_CONFIRM_DESTRUCTIVE=true, destructive actions require `confirm: true`; first call returns a structured `requiresConfirmation` preview. Destructive ops are written to BX24_AUDIT_LOG (JSONL)."
  );
}

export interface McpServerBundle {
  server: Server;
  apiClient: Bitrix24ApiClient;
  tools: ToolDefinition[];
  toolMap: Map<string, ToolDefinition>;
}

export function createServer(config: Bitrix24Config): McpServerBundle {
  const apiClient = new Bitrix24ApiClient(config);
  const tools = getAllTools(apiClient, config);
  const toolMap = new Map<string, ToolDefinition>(tools.map((t) => [t.name, t]));

  const server = new Server(
    { name: "mcp-b24", version: VERSION },
    {
      capabilities: { tools: {} },
      instructions: buildInstructions(),
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<Record<string, unknown>> => {
    const toolName = request.params.name;
    const args = (request.params.arguments || {}) as Record<string, unknown>;
    const tool = toolMap.get(toolName);
    if (!tool) {
      return errorResult(`Unknown tool: ${toolName}`) as unknown as Record<string, unknown>;
    }
    try {
      return (await tool.handler(args)) as unknown as Record<string, unknown>;
    } catch (err) {
      if (err instanceof Bitrix24ApiError) {
        return apiErrorResult(err) as unknown as Record<string, unknown>;
      }
      const message = err instanceof Error ? err.message : String(err);
      return errorResult(message) as unknown as Record<string, unknown>;
    }
  });

  return { server, apiClient, tools, toolMap };
}

// Re-export for tests/inspectors.
export { NON_ACTION_TOOLS };