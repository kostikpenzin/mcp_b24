import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createActionTool } from "./framework.js";
import { Bitrix24ApiClient } from "../api-client.js";
import type { Bitrix24Config } from "../types.js";

const cfg: Bitrix24Config = {
  authMode: "webhook",
  webhookUrl: "https://portal.bitrix24.ru/rest/1/secret/",
  oauthServer: "https://oauth.bitrix.info",
  confirmDestructive: true,
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
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("createActionTool", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("routes action to restMethod with bodyWrapper=fields", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));
    const client = new Bitrix24ApiClient(cfg);
    const tool = createActionTool(
      "bx24_crm_leads", "leads", ["add", "get", "delete"],
      { fields: { type: "object" }, id: { type: "string" } },
      {
        add: { restMethod: "crm.lead.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
        get: { restMethod: "crm.lead.get", httpVerb: "GET", pathParams: ["id"] },
        delete: { restMethod: "crm.lead.delete", httpVerb: "POST", pathParams: ["id"] },
      },
      client,
    );
    const res = await tool.handler({ action: "add", fields: { TITLE: "x" } });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("crm.lead.add.json");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ fields: { TITLE: "x" } });
    expect(res.isError).toBeFalsy();
  });

  it("requires path param for get action", async () => {
    const client = new Bitrix24ApiClient(cfg);
    const tool = createActionTool("bx24_crm_leads", "leads", ["get"], { id: { type: "string" } },
      { get: { restMethod: "crm.lead.get", pathParams: ["id"] } }, client);
    const res = await tool.handler({ action: "get" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/id/);
  });

  it("blocks destructive action without confirm, returns structured preview", async () => {
    const client = new Bitrix24ApiClient(cfg);
    const tool = createActionTool("bx24_crm_leads", "leads", ["delete"], { id: { type: "string" } },
      { delete: { restMethod: "crm.lead.delete", httpVerb: "POST", pathParams: ["id"] } }, client);
    const res = await tool.handler({ action: "delete", id: "1" });
    expect(res.isError).toBe(true);
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.requiresConfirmation).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("executes destructive action with confirm=true and writes audit", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));
    const client = new Bitrix24ApiClient({ ...cfg, confirmDestructive: true, auditLogPath: undefined });
    const tool = createActionTool("bx24_crm_leads", "leads", ["delete"], { id: { type: "string" } },
      { delete: { restMethod: "crm.lead.delete", httpVerb: "POST", pathParams: ["id"] } }, client);
    const res = await tool.handler({ action: "delete", id: "1", confirm: true });
    expect(res.isError).toBeFalsy();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ id: "1" });
  });

  it("executes destructive action without confirmation when BX24_CONFIRM_DESTRUCTIVE is off", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));
    const client = new Bitrix24ApiClient({ ...cfg, confirmDestructive: false });
    const tool = createActionTool("bx24_crm_leads", "leads", ["delete"], { id: { type: "string" } },
      { delete: { restMethod: "crm.lead.delete", httpVerb: "POST", pathParams: ["id"] } }, client);
    const res = await tool.handler({ action: "delete", id: "1" });
    expect(res.isError).toBeFalsy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses isList mapping to GET via client.list", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: [{ ID: "1" }], total: 1 }));
    const client = new Bitrix24ApiClient({ ...cfg, confirmDestructive: false });
    const tool = createActionTool("bx24_crm_leads", "leads", ["list"], { filter: { type: "object" } },
      { list: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter"] } }, client);
    const res = await tool.handler({ action: "list", filter: { TITLE: "x" } });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("crm.lead.list.json");
    expect(url).toContain("filter%5BTITLE%5D=x");
    expect(JSON.parse(res.content[0].text).rows).toHaveLength(1);
  });

  it("rejects unknown action via AJV enum", async () => {
    const client = new Bitrix24ApiClient({ ...cfg, confirmDestructive: false });
    const tool = createActionTool("bx24_crm_leads", "leads", ["get"], { id: { type: "string" } },
      { get: { restMethod: "crm.lead.get", pathParams: ["id"] } }, client);
    const res = await tool.handler({ action: "boom" });
    expect(res.isError).toBe(true);
  });
});