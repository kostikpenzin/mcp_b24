import http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Bitrix24Config } from "./types.js";
import { MAX_HTTP_BODY_BYTES } from "./constants.js";

/** Connect the MCP server over stdio (local AI clients). */
export async function startStdio(server: Server): Promise<() => Promise<void>> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return async () => {
    await server.close();
    await transport.close();
  };
}

// CORS is opt-in (BX24_CORS_ORIGIN, empty = disabled). Echoing `*` by default
// would let any web page drive the unauthenticated MCP server — and the
// Bitrix24 portal behind it — from the user's browser.
function corsAllowed(cfgOrigin: string, reqOrigin: string | undefined): boolean {
  if (!cfgOrigin) return false;
  if (cfgOrigin === "*") return true;
  return !!reqOrigin && reqOrigin === cfgOrigin;
}

// Host-header allowlist: DNS rebinding makes an attacker-controlled domain
// resolve to 127.0.0.1, which turns the request "same-origin" and bypasses
// CORS entirely. Only local names and IP literals are accepted.
function isHostAllowed(hostHeader: string | undefined, cfgHost: string): boolean {
  if (!hostHeader) return false;
  let hostname = hostHeader.split(",")[0].trim().toLowerCase();
  if (!hostname) return false;
  if (hostname.startsWith("[")) {
    const end = hostname.indexOf("]");
    if (end !== -1) hostname = hostname.slice(1, end);
  } else {
    const colon = hostname.lastIndexOf(":");
    if (colon !== -1 && !hostname.slice(colon + 1).includes(":")) hostname = hostname.slice(0, colon);
  }
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true;
  if (hostname === cfgHost.toLowerCase()) return true;
  // IP literals (v4 pattern, or anything that still contains a colon → v6).
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return true;
  return hostname.includes(":");
}

// Constant-time comparison (digests make lengths uniform).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function json(res: http.ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

/**
 * Connect the MCP server over Streamable HTTP (stateless mode) at the configured
 * host/port/path. The SDK forbids reusing a stateless transport across requests,
 * so a fresh StreamableHTTPServerTransport is created and connected to the shared
 * server for each incoming request, then closed when the request completes.
 *
 * Gateway hardening (in order): path match → Host allowlist → CORS preflight →
 * optional bearer token (BX24_HTTP_TOKEN) → body size cap.
 */
export async function startHttp(
  server: Server,
  cfg: Bitrix24Config,
): Promise<() => Promise<void>> {
  const httpServer = http.createServer(async (req, res) => {
    if (cfg.httpPath && req.url && new URL(req.url, "http://dummy").pathname !== cfg.httpPath) {
      json(res, 404, { error: "Not found" });
      return;
    }

    if (!isHostAllowed(req.headers.host, cfg.httpHost)) {
      json(res, 403, { error: "Forbidden" });
      return;
    }

    // Handle CORS preflight (OPTIONS) so browser-based MCP clients can connect.
    if (req.method === "OPTIONS") {
      const origin = req.headers.origin;
      if (corsAllowed(cfg.corsOrigin, origin)) {
        res.writeHead(204, {
          "access-control-allow-origin": cfg.corsOrigin,
          "access-control-allow-methods": "POST, OPTIONS",
          // Reflect the client's requested headers: browser MCP clients send
          // more than Content-Type/Accept (e.g. mcp-session-id).
          "access-control-allow-headers":
            (req.headers["access-control-request-headers"] as string | undefined) ??
            "Content-Type, Accept",
          "access-control-max-age": "86400",
          vary: "Origin",
        });
      } else {
        // 204 without CORS headers — the browser will block the request.
        res.writeHead(204);
      }
      res.end();
      return;
    }

    if (cfg.httpToken && !safeEqual(req.headers.authorization ?? "", `Bearer ${cfg.httpToken}`)) {
      res.writeHead(401, { "content-type": "application/json", "www-authenticate": "Bearer" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // Read and parse the JSON body, then hand it to the transport. The size
    // cap stops unbounded buffering of oversized bodies.
    const chunks: Buffer[] = [];
    let total = 0;
    let tooLarge = false;
    for await (const chunk of req) {
      const buf = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer);
      total += buf.length;
      if (total > MAX_HTTP_BODY_BYTES) {
        tooLarge = true;
        break;
      }
      chunks.push(buf);
    }
    if (tooLarge) {
      json(res, 413, { error: "Payload too large" });
      req.resume(); // drain the rest so the client sees the response cleanly
      return;
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    let parsedBody: unknown;
    if (raw.length > 0) {
      try {
        parsedBody = JSON.parse(raw);
      } catch {
        json(res, 400, { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null });
        return;
      }
    }
    // A stateless transport is single-use; create a fresh one per request.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    // CORS headers on the actual response, only for allowed origins.
    if (corsAllowed(cfg.corsOrigin, req.headers.origin)) {
      res.setHeader("access-control-allow-origin", cfg.corsOrigin);
      res.setHeader("vary", "Origin");
    }
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, parsedBody);
    } catch (err) {
      if (!res.headersSent) {
        json(res, 500, { jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
      }
      console.error("HTTP transport error:", err);
    } finally {
      await transport.close();
    }
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(cfg.httpPort, cfg.httpHost, resolve);
  });
  console.log(`Bitrix24 MCP HTTP transport listening on http://${cfg.httpHost}:${cfg.httpPort}${cfg.httpPath}`);

  return async () => {
    await server.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  };
}