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
    "tasks, chats, files, calendar, HR, smart processes, mail, telephony, workflows, events. " +
    `Wraps Bitrix24 REST (${API_VERSION}). Auth handled automatically via webhook (BX24_WEBHOOK_URL) or OAuth 2.0 (BX24_DOMAIN + client credentials, auto-refresh). The AI agent never sees credentials.\n\n` +
    "Most tools are action-based: each groups a REST domain and selects the operation with an `action` parameter.\n\n" +
    "NATURAL LANGUAGE MAPPING (RU/EN → tool + action):\n\n" +
    "CRM:\n" +
    "  - bx24_crm_leads: add/get/list/update/delete/fields/contact_*/userfield_*/convert (лиды/leads)\n" +
    "  - bx24_crm_deals: add/get/list/update/delete/fields/category_*/getProductRows/setProductRows/getContactBindings (сделки/deals + воронки)\n" +
    "  - bx24_crm_contacts: add/get/list/update/delete/fields/company_*/userfield_* (контакты)\n" +
    "  - bx24_crm_companies: add/get/list/update/delete/fields/contact_*/userfield_* (компании)\n" +
    "  - bx24_crm_invoices: add/get/list/update/delete/fields/stage_list/*ProductRows (счета/SMART_INVOICE, entityTypeId=31 auto)\n" +
    "  - bx24_crm_products: product_*/section_*/price_*/store_*/productrow_* (товары/каталог)\n" +
    "  - bx24_crm_activities: add/get/list/update/delete/fields/complete/timeline_*/binding_*/count (дела/звонки/встречи)\n" +
    "  - bx24_crm_requisites: add/get/list/update/delete/preset_*/link_add (реквизиты)\n" +
    "  - bx24_crm_duplicates: findbycomm/findbyfields/merge/mergeBatch (дубли)\n" +
    "  - bx24_smart_processes: type_*/item_* (умные процессы; item_* require typeId)\n\n" +
    "TASKS & COLLAB:\n" +
    "  - bx24_tasks: full lifecycle + checklists + comments + elapsed + flows + stages (задачи)\n" +
    "  - bx24_projects: create/get/list/update/delete/user_*/set_owner/feature_* (проекты/группы)\n" +
    "  - bx24_disk: storage_*/folder_*/file_* + versions + external links (Диск)\n" +
    "  - bx24_im: message_*/notify_*/user_*/search_*/counters_get/recent_*/dialog_*/bot_list (мессенджер)\n" +
    "  - bx24_im_chat: add/get/update*/setOwner/user_*/leave/mute/sendMessage/editMessage/deleteMessage/searchMessages/readAll/uploadFile (чаты)\n" +
    "  - bx24_conf: create/get/list/delete/join/leave (конференции)\n" +
    "  - bx24_calendar: event_*/section_*/meeting_status_set/resource_list/accessibility_get/settings_get (календарь)\n\n" +
    "ORG:\n" +
    "  - bx24_users: current/get/listByDepartment/search/fields/userfield_*/add/update/delete (пользователи)\n" +
    "  - bx24_departments: get/list/add/update/delete/fields/im_get (отделы/оргструктура)\n" +
    "  - bx24_time: status_open/close/pause/get/update + time_settings (учёт времени)\n" +
    "  - bx24_hr: employee_*/invite/dismiss/transfer/info (HR/кадры)\n\n" +
    "BIZ:\n" +
    "  - bx24_lists: list_*/field_*/element_*/section_list (универсальные списки)\n" +
    "  - bx24_mail: mailbox_*/message_*/recipient_*/mailservice_*/filter_*/message_mark (почта)\n" +
    "  - bx24_reports: deal_pipeline/lead_source/user_activity/task_completion/deal_conversion/funnel_stages (аналитика)\n" +
    "  - bx24_marketing: segment_*/broadcast_send/lead_filter/tradeplatform_list (маркетинг)\n" +
    "  - bx24_workflows: template_*/start/kill/task_*/robot_*/activity_*/instance_* (бизнес-процессы)\n" +
    "  - bx24_telephony: externalLine_*/externalCall_*/sip_*/call_followup_get/voximplant_* (телефония)\n" +
    "  - bx24_events: bind/unbind/get/offline_*/get_supported (события/подписки)\n\n" +
    "GENERIC:\n" +
    "  - bx24_batch: combine up to 50 REST calls; reference earlier results via $result[key]\n" +
    "  - bx24_call: invoke ANY Bitrix24 REST method by name with arbitrary params (escape-hatch)\n\n" +
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
  const tools = getAllTools(apiClient);
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