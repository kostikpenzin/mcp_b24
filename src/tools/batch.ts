import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition, ToolResult } from "../types.js";
import { errorResult, successResult } from "../error.js";
import { validateArgs } from "./validate.js";
import { API_VERSION } from "../constants.js";

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
      },
      required: ["cmd"],
    },
    handler: async (args): Promise<ToolResult> => {
      const err = validateArgs(args, {
        properties: {
          cmd: { type: "object", additionalProperties: { type: "string" } },
          halt: { type: "boolean" },
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

      const params: Record<string, unknown> = { cmd };
      if (args.halt === true) params.halt = 1;

      const result = await client.callMethod("batch", params, { httpVerb: "POST" });
      return successResult(result);
    },
  };
}