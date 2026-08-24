import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition, ToolResult } from "../types.js";
import { errorResult, successResult } from "../error.js";
import { validateArgs } from "./validate.js";
import { P } from "./params.js";
import { API_VERSION } from "../constants.js";

// Escape-hatch: call any Bitrix24 REST method by name with arbitrary params.
// Covers methods not yet wrapped in dedicated tools. Destructive confirmation
// is applied when the method name looks destructive (delete/remove/...).
const DESTRUCTIVE_METHOD_RE = /\.(delete|remove|detach|kick|cancel|stop|close)\b/i;

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

      if (
        client.isConfirmDestructive() &&
        DESTRUCTIVE_METHOD_RE.test(method) &&
        !args.confirm
      ) {
        return {
          content: [{ type: "text", text: `⚠️ Confirmation required.\n\nMethod "${method}" looks destructive. Call again with "confirm": true to proceed.` }],
          isError: true,
        };
      }

      const params = (args.params as Record<string, unknown>) || {};
      const opts = args.httpVerb ? { httpVerb: args.httpVerb as "GET" | "POST" } : undefined;
      const result = await client.callMethod(method, params, opts);
      return successResult(result);
    },
  };
}