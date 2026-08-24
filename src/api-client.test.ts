import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Bitrix24ApiClient } from "./api-client.js";
import { Bitrix24ApiError } from "./error.js";
import type { Bitrix24Config } from "./types.js";

function webhookConfig(overrides: Partial<Bitrix24Config> = {}): Bitrix24Config {
  return {
    authMode: "webhook",
    webhookUrl: "https://portal.bitrix24.ru/rest/1/secret/",
    oauthServer: "https://oauth.bitrix.info",
    confirmDestructive: false,
    autoPaginate: false,
    maxRows: 5000,
    rateLimitRps: 100,
    rateLimitBurst: 100,
    lang: "ru",
    logLevel: "info",
    transport: "stdio",
    httpHost: "127.0.0.1",
    httpPort: 3000,
    httpPath: "/mcp",
    ...overrides,
  };
}

function oauthConfig(overrides: Partial<Bitrix24Config> = {}): Bitrix24Config {
  return {
    authMode: "oauth",
    domain: "https://portal.bitrix24.ru",
    clientId: "cid",
    clientSecret: "csec",
    refreshToken: "rtok",
    accessToken: "atok",
    oauthServer: "https://oauth.bitrix.info",
    confirmDestructive: false,
    autoPaginate: false,
    maxRows: 5000,
    rateLimitRps: 100,
    rateLimitBurst: 100,
    lang: "ru",
    logLevel: "info",
    transport: "stdio",
    httpHost: "127.0.0.1",
    httpPort: 3000,
    httpPath: "/mcp",
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("Bitrix24ApiClient — webhook URL", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("builds the .json URL and GETs when no params", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: [{ ID: "1" }], total: 1 }));
    const client = new Bitrix24ApiClient(webhookConfig());
    const res = await client.callMethod("crm.lead.list");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://portal.bitrix24.ru/rest/1/secret/crm.lead.list.json");
    expect(init.method).toBe("GET");
    expect((res as { result: unknown[] }).result).toHaveLength(1);
  });

  it("uses POST with JSON body when params are present", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));
    const client = new Bitrix24ApiClient(webhookConfig());
    await client.callMethod("crm.lead.add", { fields: { TITLE: "Test" } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ fields: { TITLE: "Test" } });
  });
});

describe("Bitrix24ApiClient — oauth URL + auto-refresh", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("appends auth token to query and uses client_endpoint after refresh", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "expired_token", error_description: "expired" }))
      .mockResolvedValueOnce(jsonResponse({ access_token: "newtok", refresh_token: "newrt", client_endpoint: "https://oauth-portal.bitrix24.ru/rest/" }))
      .mockResolvedValueOnce(jsonResponse({ result: "ok" }));
    const client = new Bitrix24ApiClient(oauthConfig());
    const res = await client.callMethod("crm.lead.get", { id: "1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((res as { result: string }).result).toBe("ok");
    // token refresh POSTed to oauth.bitrix.info
    const refreshUrl = (fetchMock.mock.calls[1] as [string, RequestInit])[0];
    expect(refreshUrl).toBe("https://oauth.bitrix.info/oauth/token/");
    // retry used the client_endpoint from the refresh response
    const retryUrl = (fetchMock.mock.calls[2] as [string, RequestInit])[0];
    expect(retryUrl).toContain("https://oauth-portal.bitrix24.ru/rest/crm.lead.get.json");
    expect(retryUrl).toContain("auth=newtok");
  });

  it("falls back to portal domain when no client_endpoint is returned", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "expired_token" }))
      .mockResolvedValueOnce(jsonResponse({ access_token: "t2", refresh_token: "r2" }))
      .mockResolvedValueOnce(jsonResponse({ result: "ok" }));
    const client = new Bitrix24ApiClient(oauthConfig());
    await client.callMethod("crm.lead.get", { id: "1" });
    const retryUrl = (fetchMock.mock.calls[2] as [string, RequestInit])[0];
    expect(retryUrl).toContain("https://portal.bitrix24.ru/rest/crm.lead.get.json");
  });

  it("does not attempt refresh in webhook mode", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "NO_AUTH_FOUND", error_description: "no auth" }));
    const client = new Bitrix24ApiClient(webhookConfig());
    await expect(client.callMethod("crm.lead.get", { id: "1" })).rejects.toThrow(Bitrix24ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("Bitrix24ApiClient — error parsing & limits", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("throws Bitrix24ApiError when body contains error field (HTTP 200)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "QUERY_LIMIT_EXCEEDED", error_description: "too many" }));
    const client = new Bitrix24ApiClient(webhookConfig());
    // RPS=2 but this is a 200 with error field — not retried (503 path), surfaces immediately
    await expect(client.callMethod("crm.lead.list")).rejects.toMatchObject({
      reason: "QUERY_LIMIT_EXCEEDED", message: "too many",
    });
  });

  it("retries with backoff on HTTP 503 then succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("Service Unavailable", { status: 503 }))
      .mockResolvedValueOnce(jsonResponse({ result: [] }));
    const client = new Bitrix24ApiClient(webhookConfig({ rateLimitBurst: 100, rateLimitRps: 100 }));
    const res = await client.callMethod("crm.lead.list");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((res as { result: unknown[] }).result).toEqual([]);
  });

  it("throws on non-JSON HTTP error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));
    const client = new Bitrix24ApiClient(webhookConfig());
    await expect(client.callMethod("crm.lead.list")).rejects.toMatchObject({ status: 500 });
  });
});

describe("Bitrix24ApiClient — pagination", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("returns single page when autoPaginate is off", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: [{ ID: "1" }], next: 50, total: 100 }));
    const client = new Bitrix24ApiClient(webhookConfig());
    const out = await client.list("crm.lead.list");
    expect(out.rows).toHaveLength(1);
    expect(out.next).toBe(50);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("collects all pages when autoPaginate is on", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ result: [{ ID: "1" }], next: 1, total: 2 }))
      .mockResolvedValueOnce(jsonResponse({ result: [{ ID: "2" }], total: 2 }));
    const client = new Bitrix24ApiClient(webhookConfig({ autoPaginate: true }));
    const out = await client.list("crm.lead.list");
    expect(out.rows).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caps collected rows at maxRows", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ result: [{ ID: "1" }, { ID: "2" }], next: 2, total: 10 }))
      .mockResolvedValueOnce(jsonResponse({ result: [{ ID: "3" }], next: 3, total: 10 }));
    const client = new Bitrix24ApiClient(webhookConfig({ autoPaginate: true, maxRows: 2 }));
    const out = await client.list("crm.lead.list");
    expect(out.rows).toHaveLength(2);
  });
});