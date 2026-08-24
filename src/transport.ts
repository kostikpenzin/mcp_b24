import http from "node:http";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Bitrix24Config } from "./types.js";

/** Connect the MCP server over stdio (local AI clients). */
export async function startStdio(server: Server): Promise<() => Promise<void>> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return async () => {
    await server.close();
    await transport.close();
  };
}

/**
 * Connect the MCP server over Streamable HTTP (stateless mode) at the configured
 * host/port/path. The SDK forbids reusing a stateless transport across requests,
 * so a fresh StreamableHTTPServerTransport is created and connected to the shared
 * server for each incoming request, then closed when the request completes.
 */
export async function startHttp(
  server: Server,
  cfg: Bitrix24Config,
): Promise<() => Promise<void>> {
  const httpServer = http.createServer(async (req, res) => {
    if (cfg.httpPath && req.url && new URL(req.url, "http://dummy").pathname !== cfg.httpPath) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    // Read and parse the JSON body, then hand it to the transport.
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    let parsedBody: unknown;
    if (raw.length > 0) {
      try {
        parsedBody = JSON.parse(raw);
      } catch {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
        return;
      }
    }
    // A stateless transport is single-use; create a fresh one per request.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, parsedBody);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null }));
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