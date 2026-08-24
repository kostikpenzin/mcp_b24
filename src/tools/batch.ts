import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition, ToolResult } from "../types.js";
import { errorResult, successResult } from "../error.js";
import { validateArgs } from "./validate.js";
import { API_VERSION } from "../constants.js";

// Keep in sync with DESTRUCTIVE_KEYWORDS in framework.ts / call.ts.
const DESTRUCTIVE_KEYWORDS = [
  "delete", "remove", "detach", "exclude", "stop", "cancel",
  "reject", "complete", "close", "mute", "leave", "kick", "destroy",
  "markdeleted", "kill", "unbind", "clear",
];

// A cmd value is "method?param=value&..." — the method is everything before "?".
function cmdMethod(cmdValue: string): string {
  const q = cmdValue.indexOf("?");
  return (q === -1 ? cmdValue : cmdValue.slice(0, q)).toLowerCase();
}

function isDestructiveCmd(cmdValue: string): boolean {
  const method = cmdMethod(cmdValue);
  return DESTRUCTIVE_KEYWORDS.some((kw) => method.includes(kw));
}

// Bitrix24 `batch` wraps many REST calls in one request. `cmd` maps logical
// keys to "method?param=value&..." strings; results come back keyed by the same
// names and can be referenced as $result[key] in later commands.
export function createBatchTool(client: Bitrix24ApiClient): ToolDefinition {
  return {
    name: "bx24_batch",
    description: `Bitrix24 batch: combine multiple REST calls into one request. Method batch (${API_VERSION}). Reference earlier results inside later commands with $result[key]. RU/EN: пакет, батч, несколько вызовов, объединить вызовы / batch, combine calls, multiple calls.`,
    inputSchema: {
      type: "object",
      properties: {
        cmd: {
          type: "object",
          description: "Commands keyed by logical name. Each value is a REST call string like 'crm.lead.list?filter[STATUS_ID]=NEW&select[]=ID&select[]=TITLE'. Reference results: 'crm.deal.add?fields[TITLE]=$result[lead][TITLE]'.",
          additionalProperties: { type: "string" },
        },
        halt: { type: "boolean", description: "If true, batch stops on the first command error (default false)" },
        confirm: { type: "boolean", description: "Set to true to confirm destructive commands when BX24_CONFIRM_DESTRUCTIVE is enabled." },
      },
      required: ["cmd"],
    },
    handler: async (args): Promise<ToolResult> => {
      const err = validateArgs(args, {
        properties: {
          cmd: { type: "object", additionalProperties: { type: "string" } },
          halt: { type: "boolean" },
          confirm: { type: "boolean" },
        },
        required: ["cmd"],
      });
      if (err) return errorResult(err);

      const cmd = args.cmd as Record<string, string>;
      if (Object.keys(cmd).length === 0) {
        return errorResult("'cmd' must contain at least one command");
      }
      if (Object.keys(cmd).length > 50) {
        return errorResult("A single batch supports at most 50 commands; split into multiple bx24_batch calls.");
      }

      // Two-phase destructive confirmation: scan each command's method. A single
      // batch can issue many deletes/removes in one round-trip, so without this
      // check it would bypass the per-action confirmation enforced elsewhere.
      const destructiveCmds = Object.entries(cmd)
        .filter(([, v]) => isDestructiveCmd(v))
        .map(([k, v]) => `${k}: ${cmdMethod(v)}`);
      if (client.isConfirmDestructive() && destructiveCmds.length > 0 && !args.confirm) {
        client.recordDestructive({
          tool: "bx24_batch",
          action: "batch",
          restMethod: "batch",
          params: { cmd },
          result: "denied",
          durationMs: 0,
        });
        return {
          content: [{
            type: "text",
            text: `⚠️ Confirmation required.\n\nThe batch contains destructive commands:\n${destructiveCmds.map((c) => `  - ${c}`).join("\n")}\n\nCall again with "confirm": true to proceed.`,
          }],
          isError: true,
        };
      }

      const params: Record<string, unknown> = { cmd };
      if (args.halt === true) params.halt = 1;

      const started = Date.now();
      let result: unknown;
      let resultStatus: "ok" | "error" = "ok";
      try {
        result = await client.callMethod("batch", params, { httpVerb: "POST" });
      } catch (err) {
        resultStatus = "error";
        throw err;
      } finally {
        if (destructiveCmds.length > 0) {
          client.recordDestructive({
            tool: "bx24_batch",
            action: "batch",
            restMethod: "batch",
            params: { cmd },
            result: resultStatus,
            durationMs: Date.now() - started,
          });
        }
      }
      return successResult(result);
    },
  };
}