import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition, ToolResult } from "../types.js";
import { errorResult, successResult } from "../error.js";
import { validateArgs } from "./validate.js";
import { P } from "./params.js";
import { DESTRUCTIVE_KEYWORDS, maskParams } from "./framework.js";
import { API_VERSION } from "../constants.js";

// Escape-hatch: call any Bitrix24 REST method by name with arbitrary params.
// Covers methods not yet wrapped in dedicated tools. Destructive confirmation
// is applied when the method name looks destructive (delete/remove/...),
// using the shared DESTRUCTIVE_KEYWORDS from framework.ts.

function isDestructiveMethod(method: string): boolean {
  const lower = method.toLowerCase();
  return DESTRUCTIVE_KEYWORDS.some((kw) => lower.includes(kw));
}

export function createCallTool(client: Bitrix24ApiClient): ToolDefinition {
  return {
    name: "bx24_call",
    description: `Universal Bitrix24 REST call: invoke any REST method by name with arbitrary params. Escape-hatch for methods not covered by dedicated tools (${API_VERSION}). RU/EN: вызови метод, сделай произвольный вызов, вызови rest-метод / call rest method, invoke method, raw rest call.`,
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", description: "Bitrix24 REST method name, e.g. 'crm.lead.list', 'im.chat.get', 'disk.folder.getchildren'." },
        params: P.params,
        httpVerb: { type: "string", enum: ["GET", "POST"], description: "HTTP verb (default POST if params present, else GET)" },
        confirm: { type: "boolean", description: "Set to true to confirm destructive methods when BX24_CONFIRM_DESTRUCTIVE is enabled." },
      },
      required: ["method"],
    },
    handler: async (args): Promise<ToolResult> => {
      const err = validateArgs(args, {
        properties: {
          method: { type: "string" },
          params: { type: "object" },
          httpVerb: { type: "string", enum: ["GET", "POST"] },
          confirm: { type: "boolean" },
        },
        required: ["method"],
      });
      if (err) return errorResult(err);

      const method = args.method as string;
      if (!/^[a-z][a-z0-9._-]*$/i.test(method)) {
        return errorResult(`Invalid method name: ${method}`);
      }
      // Route `batch` to the dedicated bx24_batch tool, which enforces the
      // 50-command cap and destructive-action confirmation. Allowing it here
      // would let a caller bypass both limits and all safety checks.
      if (method.toLowerCase() === "batch") {
        return errorResult("Use the bx24_batch tool for the 'batch' method (it enforces the 50-command cap and destructive-action confirmation).");
      }

      const destructive = isDestructiveMethod(method);
      if (
        client.isConfirmDestructive() &&
        destructive &&
        !args.confirm
      ) {
        client.recordDestructive({
          tool: "bx24_call",
          action: method,
          restMethod: method,
          params: maskParams({ method, params: args.params ?? {} }) as Record<string, unknown>,
          result: "denied",
          durationMs: 0,
        });
        return {
          content: [{ type: "text", text: `⚠️ Confirmation required.\n\nMethod "${method}" looks destructive. Call again with "confirm": true to proceed.` }],
          isError: true,
        };
      }

      const params = (args.params as Record<string, unknown>) || {};
      const opts = args.httpVerb ? { httpVerb: args.httpVerb as "GET" | "POST" } : undefined;
      const started = Date.now();
      let result: unknown;
      let resultStatus: "ok" | "error" = "ok";
      try {
        result = await client.callMethod(method, params, opts);
      } catch (err) {
        resultStatus = "error";
        throw err;
      } finally {
        if (destructive) {
          client.recordDestructive({
            tool: "bx24_call",
            action: method,
            restMethod: method,
            params: maskParams({ method, params }) as Record<string, unknown>,
            result: resultStatus,
            durationMs: Date.now() - started,
          });
        }
      }
      return successResult(result);
    },
  };
}