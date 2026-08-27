import { describe, it, expect, afterEach } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { startHttp } from "./transport.js";
import type { Bitrix24Config } from "./types.js";

const cfgBase: Bitrix24Config = {
  authMode: "webhook",
  webhookUrl: "https://portal.bitrix24.ru/rest/1/secret/",
  oauthServer: "https://oauth.bitrix.info",
  confirmDestructive: false,
  autoPaginate: false,
  maxRows: 5000,
  rateLimitRps: 100,
  rateLimitBurst: 100,
  lang: "en",
  logLevel: "silent",
  transport: "http",
  httpHost: "127.0.0.1",
  httpPort: 3000,
  httpPath: "/mcp",
  corsOrigin: "",
};

// The transport only needs the shared Server for requests that pass all the
// gateway checks; a stub with a no-op close is enough. Requests that reach
// server.connect() fail with 500 — which is how we assert a request *passed*
// the gateway (host / token / size) and reached the transport layer.
const fakeServer = { close: async () => {} } as unknown as Server;

function httpCfg(overrides: Partial<Bitrix24Config> = {}): Bitrix24Config {
  return { ...cfgBase, ...overrides };
}

async function freePort(): Promise<number> {
  const probe = http.createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = (probe.address() as AddressInfo).port;
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  return port;
}

interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

// Raw HTTP client so tests can forge Host headers (undici forbids that via fetch).
function rawRequest(
  port: number,
  path: string,
  method: string,
  headers: Record<string, string> = {},
  body?: string,
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, path, method, headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () =>
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        }),
      );
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

describe("startHttp — gateway hardening", () => {
  const stops: Array<() => Promise<void>> = [];
  afterEach(async () => {
    while (stops.length) await stops.pop()!();
  });

  async function start(overrides: Partial<Bitrix24Config> = {}): Promise<number> {
    const port = await freePort();
    const stop = await startHttp(fakeServer, httpCfg({ httpPort: port, ...overrides }));
    stops.push(stop);
    return port;
  }

  it("sends no CORS headers when BX24_CORS_ORIGIN is not configured (default)", async () => {
    const port = await start();
    const res = await rawRequest(port, "/mcp", "OPTIONS", {
      origin: "https://app.example.com",
      "access-control-request-method": "POST",
    });
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("echoes the configured origin and requested headers on preflight", async () => {
    const port = await start({ corsOrigin: "https://app.example.com" });
    const res = await rawRequest(port, "/mcp", "OPTIONS", {
      origin: "https://app.example.com",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type, mcp-session-id",
    });
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://app.example.com");
    expect(String(res.headers["access-control-allow-headers"])).toContain("mcp-session-id");
    expect(String(res.headers.vary)).toContain("Origin");
  });

  it("withholds CORS headers from a disallowed origin", async () => {
    const port = await start({ corsOrigin: "https://app.example.com" });
    const res = await rawRequest(port, "/mcp", "OPTIONS", {
      origin: "https://evil.example",
      "access-control-request-method": "POST",
    });
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("supports wildcard corsOrigin when explicitly configured", async () => {
    const port = await start({ corsOrigin: "*" });
    const res = await rawRequest(port, "/mcp", "OPTIONS", {
      origin: "https://any.example",
      "access-control-request-method": "POST",
    });
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("rejects non-local Host headers (DNS-rebinding defence)", async () => {
    const port = await start();
    const res = await rawRequest(port, "/mcp", "POST", { host: "attacker.example" }, "{}");
    expect(res.status).toBe(403);
  });

  it("accepts localhost and IP-literal Host headers", async () => {
    const port = await start();
    const localhost = await rawRequest(port, "/mcp", "POST", { host: "localhost" }, "{}");
    expect(localhost.status).toBe(500); // reached the (stub) transport layer
    const byIp = await rawRequest(port, "/mcp", "POST", { host: "192.168.1.10" }, "{}");
    expect(byIp.status).toBe(500);
  });

  it("requires the bearer token when BX24_HTTP_TOKEN is set", async () => {
    const port = await start({ httpToken: "s3cret" });
    const noAuth = await rawRequest(port, "/mcp", "POST", {}, "{}");
    expect(noAuth.status).toBe(401);
    const wrong = await rawRequest(port, "/mcp", "POST", { authorization: "Bearer nope" }, "{}");
    expect(wrong.status).toBe(401);
    const good = await rawRequest(port, "/mcp", "POST", { authorization: "Bearer s3cret" }, "{}");
    expect(good.status).toBe(500); // passed auth, reached the transport layer
  });

  it("returns 413 for bodies exceeding the size cap", async () => {
    const port = await start();
    const big = "a".repeat(2 * 1024 * 1024 + 1);
    const res = await rawRequest(port, "/mcp", "POST", { "content-type": "application/json" }, big);
    expect(res.status).toBe(413);
  });

  it("still returns 404 for unknown paths", async () => {
    const port = await start();
    const res = await rawRequest(port, "/other", "POST", {}, "{}");
    expect(res.status).toBe(404);
  });
});