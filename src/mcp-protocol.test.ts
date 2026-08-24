import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "./server.js";
import { NON_ACTION_TOOLS } from "./tools/index.js";
import type { Bitrix24Config } from "./types.js";

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
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function connectClient() {
  const { server } = createServer(cfg);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
  await client.connect(clientTransport);
  const close = async () => {
    await client.close();
    await server.close();
  };
  return { client, close };
}

describe("MCP protocol integration", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); global.fetch = fetchMock as unknown as typeof fetch; });
  afterEach(() => vi.restoreAllMocks());

  it("lists 30 tools with unique bx24_ names", async () => {
    const { client, close } = await connectClient();
    const res = await client.listTools();
    expect(res.tools).toHaveLength(30);
    const names = res.tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const t of res.tools) {
      expect(t.name.startsWith("bx24_")).toBe(true);
      expect(t.inputSchema.type).toBe("object");
      const required = (t.inputSchema as { required: string[] }).required;
      if (!NON_ACTION_TOOLS.has(t.name)) expect(required).toContain("action");
    }
    await close();
  });

  it("calls bx24_crm_leads add and returns the new lead ID", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: 42 }));
    const { client, close } = await connectClient();
    const res = await client.callTool({ name: "bx24_crm_leads", arguments: { action: "add", fields: { TITLE: "X" } } });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("crm.lead.add.json");
    expect(JSON.parse(init.body as string)).toEqual({ fields: { TITLE: "X" } });
    expect((res.content as { text: string }[])[0].text).toContain("42");
    await close();
  });

  it("calls bx24_im_chat create with fields wrapper", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: "chat999" }));
    const { client, close } = await connectClient();
    await client.callTool({ name: "bx24_im_chat", arguments: { action: "add", fields: { TYPE: "chat", TITLE: "T", USERS: ["1"] } } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ fields: { TYPE: "chat", TITLE: "T", USERS: ["1"] } });
    await close();
  });

  it("calls bx24_im message_add with raw UPPER_CASE body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: "msg1" }));
    const { client, close } = await connectClient();
    await client.callTool({ name: "bx24_im", arguments: { action: "message_add", DIALOG_ID: "chat1", MESSAGE: "hello" } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ DIALOG_ID: "chat1", MESSAGE: "hello" });
    await close();
  });

  it("calls bx24_batch with cmd object", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: { a: [1], b: 2 } }));
    const { client, close } = await connectClient();
    await client.callTool({ name: "bx24_batch", arguments: { cmd: { a: "crm.lead.list", b: "user.current" } } });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ cmd: { a: "crm.lead.list", b: "user.current" } });
    await close();
  });

  it("calls bx24_call with arbitrary method", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ result: "ok" }));
    const { client, close } = await connectClient();
    await client.callTool({ name: "bx24_call", arguments: { method: "profile" } });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("profile.json");
    await close();
  });

  it("returns tool error for unknown tool name via protocol", async () => {
    const { client, close } = await connectClient();
    const res = await client.callTool({ name: "bx24_nonexistent", arguments: {} });
    expect(res.isError).toBe(true);
    await close();
  });
});