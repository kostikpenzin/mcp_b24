import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAllTools, NON_ACTION_TOOLS } from "./index.js";
import { Bitrix24ApiClient } from "../api-client.js";
import type { Bitrix24Config } from "../types.js";

const cfg: Bitrix24Config = {
  authMode: "webhook",
  webhookUrl: "https://portal.bitrix24.ru/rest/1/secret/",
  oauthServer: "https://oauth.bitrix.info",
  confirmDestructive: false,
  autoPaginate: false,
  maxRows: 5000,
  rateLimitRps: 100,
  rateLimitBurst: 100,
  lang: "ru",
  logLevel: "silent",
  transport: "stdio",
  httpHost: "127.0.0.1",
  httpPort: 3000,
  httpPath: "/mcp",
  corsOrigin: "*",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("getAllTools — registry & routing", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  const client = new Bitrix24ApiClient(cfg);
  const tools = getAllTools(client, cfg);

  it("registers exactly 43 tools (39 action + batch + call + summary + health) with unique names", () => {
    expect(tools).toHaveLength(43);
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.filter((n) => n.startsWith("bx24_"))).toHaveLength(43);
  });

  it("all tools expose object inputSchema; non-generic tools require action", () => {
    for (const t of tools) {
      expect(t.inputSchema.type).toBe("object");
      const required = t.inputSchema.required;
      if (NON_ACTION_TOOLS.has(t.name)) {
        expect(required).not.toContain("action");
      } else {
        expect(required).toContain("action");
      }
    }
  });

  const find = (name: string) => tools.find((t) => t.name === name)!;

  const cases: { name: string; action: string; args: Record<string, unknown>; expectMethod: string; expectBody?: unknown }[] = [
    { name: "bx24_crm_leads", action: "update", args: { id: "1", fields: { TITLE: "n" } }, expectMethod: "crm.lead.update", expectBody: { id: "1", fields: { TITLE: "n" } } },
    { name: "bx24_crm_deals", action: "setProductRows", args: { id: "1", rows: [{ PRODUCT_ID: "2" }] }, expectMethod: "crm.deal.productrows.set", expectBody: { id: "1", rows: [{ PRODUCT_ID: "2" }] } },
    { name: "bx24_crm_contacts", action: "list", args: { filter: { NAME: "a" } }, expectMethod: "crm.contact.list" },
    { name: "bx24_crm_companies", action: "delete", args: { id: "1" }, expectMethod: "crm.company.delete", expectBody: { id: "1" } },
    { name: "bx24_crm_products", action: "product_add", args: { fields: { NAME: "Chair" } }, expectMethod: "catalog.product.add", expectBody: { fields: { NAME: "Chair" } } },
    { name: "bx24_crm_activities", action: "complete", args: { id: "1" }, expectMethod: "crm.activity.complete", expectBody: { id: "1" } },
    { name: "bx24_crm_requisites", action: "add", args: { fields: { RQ_INN: "123" } }, expectMethod: "crm.requisite.add", expectBody: { fields: { RQ_INN: "123" } } },
    { name: "bx24_crm_duplicates", action: "findbycomm", args: { type: "email", values: ["a@b.c"] }, expectMethod: "crm.duplicate.findbycomm" },
    { name: "bx24_tasks", action: "complete", args: { taskId: "1" }, expectMethod: "tasks.task.complete", expectBody: { taskId: "1" } },
    { name: "bx24_tasks", action: "comment_add", args: { taskId: "1", commentText: "hi" }, expectMethod: "task.commentitem.add", expectBody: { taskId: "1", fields: "hi" } },
    { name: "bx24_projects", action: "create", args: { fields: { NAME: "P" } }, expectMethod: "sonet_group.create", expectBody: { fields: { NAME: "P" } } },
    { name: "bx24_disk", action: "file_upload", args: { id: "1", fileArray: [{ NAME: "a.txt", CONTENT: "bGQ=" }] }, expectMethod: "disk.folder.uploadfile", expectBody: { id: "1", file: [{ NAME: "a.txt", CONTENT: "bGQ=" }] } },
    { name: "bx24_disk", action: "folder_deleteTree", args: { id: "1" }, expectMethod: "disk.folder.deletetree" },
    { name: "bx24_im", action: "message_add", args: { DIALOG_ID: "chat1", MESSAGE: "hi" }, expectMethod: "im.message.add", expectBody: { DIALOG_ID: "chat1", MESSAGE: "hi" } },
    { name: "bx24_im_chat", action: "user_add", args: { CHAT_ID: "1", USERS: ["2"] }, expectMethod: "im.chat.user.add", expectBody: { CHAT_ID: "1", users: ["2"] } },
    { name: "bx24_conf", action: "create", args: { fields: { TITLE: "c" } }, expectMethod: "im.conference.create" },
    { name: "bx24_calendar", action: "event_add", args: { type: "user", ownerId: "1", fields: { NAME: "m" } }, expectMethod: "calendar.event.add", expectBody: { type: "user", ownerId: "1", fields: { NAME: "m" } } },
    { name: "bx24_users", action: "current", args: {}, expectMethod: "user.current" },
    { name: "bx24_departments", action: "add", args: { fields: { NAME: "IT" } }, expectMethod: "department.add", expectBody: { fields: { NAME: "IT" } } },
    { name: "bx24_time", action: "status_open", args: {}, expectMethod: "timeman.open" },
    { name: "bx24_hr", action: "invite", args: { fields: { EMAIL: "a@b.c" } }, expectMethod: "user.add", expectBody: { fields: { EMAIL: "a@b.c" } } },
    { name: "bx24_lists", action: "element_add", args: { IBLOCK_ID: "5", fields: { NAME: "e" } }, expectMethod: "lists.element.add" },
    { name: "bx24_mail", action: "message_send", args: { fields: { TO: "a@b.c", SUBJECT: "s" } }, expectMethod: "mail.message.send" },
    { name: "bx24_reports", action: "funnel_stages", args: {}, expectMethod: "crm.status.list" },
    { name: "bx24_marketing", action: "broadcast_send", args: { mailFields: { TO: "a@b.c" } }, expectMethod: "mail.message.send" },
    { name: "bx24_workflows", action: "start", args: { templateId: "1", documentId: ["crm", "DEAL", 456] }, expectMethod: "bizproc.workflow.start" },
    { name: "bx24_telephony", action: "externalLine_list", args: {}, expectMethod: "telephony.externalLine.list" },
    { name: "bx24_events", action: "bind", args: { event: "onCrmLeadAdd", handler: "https://h" }, expectMethod: "event.bind" },
    { name: "bx24_batch", action: "run", args: { cmd: { a: "crm.lead.list" } }, expectMethod: "batch" },
    { name: "bx24_call", action: "invoke", args: { method: "profile" }, expectMethod: "profile" },
    { name: "bx24_crm_quotes", action: "add", args: { fields: { TITLE: "Q" } }, expectMethod: "crm.quote.add", expectBody: { fields: { TITLE: "Q" } } },
    { name: "bx24_crm_documents", action: "document_add", args: { fields: { templateId: "1" } }, expectMethod: "crm.documentgenerator.document.add" },
    { name: "bx24_crm_currency", action: "list", args: {}, expectMethod: "crm.currency.list" },
    { name: "bx24_crm_webform", action: "list", args: {}, expectMethod: "crm.webform.list" },
    { name: "bx24_crm_tracking", action: "source_list", args: {}, expectMethod: "crm.tracking.source.list" },
    { name: "bx24_crm_automation", action: "trigger_list", args: {}, expectMethod: "crm.automation.trigger.list" },
    { name: "bx24_crm_calllists", action: "list", args: {}, expectMethod: "crm.calllist.list" },
    { name: "bx24_crm_addresses", action: "list", args: {}, expectMethod: "crm.address.list" },
    { name: "bx24_crm_stagehistory", action: "list", args: {}, expectMethod: "crm.stagehistory.list" },
    { name: "bx24_openlines", action: "config_list", args: {}, expectMethod: "imopenlines.config.list.get" },
    { name: "bx24_bots", action: "bot_list", args: {}, expectMethod: "imbot.v2.Bot.list" },
  ];

  for (const c of cases) {
    it(`routes ${c.name} action=${c.action} → ${c.expectMethod}`, async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ result: "ok" }));
      const tool = find(c.name);
      const args = c.action === "run" || c.action === "invoke"
        ? c.args
        : { action: c.action, ...c.args };
      await tool.handler(args);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain(`/${c.expectMethod}.json`);
      if (c.expectBody !== undefined) {
        expect(JSON.parse(init.body as string)).toEqual(c.expectBody);
      }
    });
  }
});
describe("getAllTools — action ↔ mappings parity (release readiness)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ result: "ok" })));
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => vi.restoreAllMocks());

  const client = new Bitrix24ApiClient(cfg);
  const tools = getAllTools(client, cfg);

  it("every action in every action-tool resolves to a mapping (no 'Unknown action')", async () => {
    const problems: string[] = [];
    for (const tool of tools) {
      if (NON_ACTION_TOOLS.has(tool.name)) continue;
      const actionProp = (tool.inputSchema as { properties: Record<string, { enum?: string[] }> }).properties.action;
      const actions = actionProp?.enum ?? [];
      for (const action of actions) {
        const res = await tool.handler({ action });
        const text = res.content.map((c) => c.text).join("\n");
        // "Unknown action" only appears when an action enum value has no mapping.
        if (text.includes("Unknown action")) {
          problems.push(`${tool.name}.${action}`);
        }
      }
    }
    expect(problems, `Unmapped actions: ${problems.join(", ")}`).toEqual([]);
  });

  it("every action-tool declares at least one action", () => {
    for (const tool of tools) {
      if (NON_ACTION_TOOLS.has(tool.name)) continue;
      const actionProp = (tool.inputSchema as { properties: Record<string, { enum?: string[] }> }).properties.action;
      expect((actionProp?.enum ?? []).length, `${tool.name} has no actions`).toBeGreaterThan(0);
    }
  });
});
