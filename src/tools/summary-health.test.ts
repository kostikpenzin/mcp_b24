import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCrmSummaryTool } from "./crm/summary.js";
import { createHealthTool } from "./health.js";
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

describe("bx24_crm_summary", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  const client = new Bitrix24ApiClient(cfg);
  const tool = createCrmSummaryTool(client);

  it("returns aggregated counts and reference data from parallel calls", async () => {
    // Simulate 6 parallel REST responses.
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("crm.lead.list")) return jsonResponse({ result: [], total: 42 });
      if (url.includes("crm.deal.list")) return jsonResponse({ result: [], total: 17 });
      if (url.includes("crm.contact.list")) return jsonResponse({ result: [], total: 99 });
      if (url.includes("crm.company.list")) return jsonResponse({ result: [], total: 8 });
      if (url.includes("crm.status.list")) return jsonResponse({
        result: [{ STATUS_ID: "NEW", NAME: "Новый" }, { STATUS_ID: "JUNK", NAME: "Мусор" }],
      });
      if (url.includes("crm.dealcategory.list")) return jsonResponse({
        result: [{ ID: "0", NAME: "Общая" }],
      });
      return jsonResponse({ result: null });
    });

    const res = await tool.handler({});
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.totalLeads).toBe(42);
    expect(data.totalDeals).toBe(17);
    expect(data.totalContacts).toBe(99);
    expect(data.totalCompanies).toBe(8);
    expect(data.leadStatuses).toHaveLength(2);
    expect(data.leadStatuses[0]).toEqual({ STATUS_ID: "NEW", NAME: "Новый" });
    expect(data.dealCategories).toHaveLength(1);
    expect(data.dealCategories[0]).toEqual({ ID: "0", NAME: "Общая" });
  });

  it("returns error result when the API call fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "INVALID_TOKEN", error_description: "bad token" }, 400));
    const res = await tool.handler({});
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("Failed to fetch CRM summary");
  });

  it("does not require an action parameter (non-action tool)", () => {
    expect(tool.inputSchema.required).toEqual([]);
  });
});

describe("bx24_health", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("reports connected status with response time on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: { CODE: "mcp-b24", SCOPE: ["crm"] } }));
    const client = new Bitrix24ApiClient(cfg);
    const tool = createHealthTool(client, cfg);

    const res = await tool.handler({});
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.status).toBe("connected");
    expect(data.authMode).toBe("webhook");
    // Portal must be host-only: the webhook secret in the URL must never leak into tool output.
    expect(data.portal).toBe("portal.bitrix24.ru");
    expect(data.portal).not.toContain("/rest/");
    expect(data.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(data.timestamp).toBeTruthy();
    expect(data.appInfo).toEqual({ CODE: "mcp-b24", SCOPE: ["crm"] });
  });

  it("falls back to user.current when app.info is unavailable (e.g. incoming webhook)", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "ACCESS_DENIED", error_description: "app.info unavailable" }, 200))
      .mockResolvedValueOnce(jsonResponse({ result: { ID: "1", NAME: "Admin" } }));
    const client = new Bitrix24ApiClient(cfg);
    const tool = createHealthTool(client, cfg);

    const res = await tool.handler({});
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.status).toBe("connected");
    expect(data.appInfo).toEqual({ fallback: "user.current", user: { ID: "1", NAME: "Admin" } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports error status when both app.info and the fallback fail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "INVALID_TOKEN", error_description: "bad token" }, 400));
    const client = new Bitrix24ApiClient(cfg);
    const tool = createHealthTool(client, cfg);

    const res = await tool.handler({});
    // A failed ping is a successful diagnostic — structured JSON with status:"error".
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.status).toBe("error");
    expect(data.error).toContain("bad token");
  });

  it("does not require an action parameter (non-action tool)", () => {
    const client = new Bitrix24ApiClient(cfg);
    const tool = createHealthTool(client, cfg);
    expect(tool.inputSchema.required).toEqual([]);
  });
});