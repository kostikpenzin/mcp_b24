import type { Bitrix24ApiClient } from "../api-client.js";
import type { Bitrix24Config, Bitrix24Response, ToolDefinition, ToolResult } from "../types.js";
import { successResult } from "../error.js";
import { API_VERSION } from "../constants.js";

interface HealthResult {
  status: "connected" | "error";
  authMode: Bitrix24Config["authMode"];
  portal: string;
  responseTimeMs: number;
  timestamp: string;
  appInfo?: unknown;
  error?: string;
}

// Diagnostic tool: pings the Bitrix24 REST API to verify credentials and
// connectivity. Useful during initial setup and troubleshooting — the LLM
// can answer "is the connection working?" without manual REST calls.
export function createHealthTool(client: Bitrix24ApiClient, config: Bitrix24Config): ToolDefinition {
  return {
    name: "bx24_health",
    description: `Bitrix24 health check: verify API connectivity, credentials, and measure response time (${API_VERSION}). RU/EN: проверь подключение, работает ли API, статус соединения, пинг / check connection, is API working, health check, ping.`,
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async (): Promise<ToolResult> => {
      // Host only — the webhook URL contains a secret that must never reach
      // the LLM, logs, or conversation history (see README Security).
      let portal = config.authMode === "webhook" ? config.webhookUrl : config.domain;
      if (portal) {
        try {
          portal = new URL(portal).host;
        } catch {
          portal = "unknown";
        }
      } else {
        portal = "unknown";
      }

      const started = Date.now();
      try {
        const res = await client.callMethod<Bitrix24Response>("app.info", {});
        const result: HealthResult = {
          status: "connected",
          authMode: config.authMode,
          portal,
          responseTimeMs: Date.now() - started,
          timestamp: new Date().toISOString(),
          appInfo: res.result,
        };
        return successResult(result);
      } catch (appInfoErr) {
        // app.info requires application context and is typically unavailable
        // to plain incoming webhooks; user.current works in both auth modes
        // and proves connectivity + credential validity just as well.
        try {
          const res = await client.callMethod<Bitrix24Response>("user.current", {});
          const result: HealthResult = {
            status: "connected",
            authMode: config.authMode,
            portal,
            responseTimeMs: Date.now() - started,
            timestamp: new Date().toISOString(),
            appInfo: { fallback: "user.current", user: res.result },
          };
          return successResult(result);
        } catch {
          const message = appInfoErr instanceof Error ? appInfoErr.message : String(appInfoErr);
          // A failed ping is a successful diagnostic — the tool worked, it just
          // found the API unreachable. Return structured data, not an error result,
          // so the LLM gets parseable JSON with the error details.
          const result: HealthResult = {
            status: "error",
            authMode: config.authMode,
            portal,
            responseTimeMs: Date.now() - started,
            timestamp: new Date().toISOString(),
            error: message,
          };
          return successResult(result);
        }
      }
    },
  };
}