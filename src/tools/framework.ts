import type { Bitrix24ApiClient } from "../api-client.js";
import type { ToolDefinition, HttpMethod, ConfirmContext } from "../types.js";
import { errorResult, successResult } from "../error.js";
import { validateArgs } from "./validate.js";
import { t } from "../i18n/index.js";

const DESTRUCTIVE_KEYWORDS = [
  "delete", "remove", "detach", "exclude", "stop", "cancel",
  "reject", "complete", "close", "mute", "leave", "kick", "destroy",
  "markDeleted", "kill", "unbind", "clear",
];

function isDestructiveAction(action: string, mapping: ActionMapping): boolean {
  if (mapping.httpVerb === "DELETE") return true;
  if (mapping.destructive) return true;
  const lower = action.toLowerCase();
  return DESTRUCTIVE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export interface ActionMapping {
  restMethod: string;
  httpVerb?: HttpMethod;
  pathParams?: string[];
  queryParams?: string[];
  bodyParam?: string;
  bodyWrapper?: string;
  emptyBody?: boolean;
  rawBody?: boolean;
  isList?: boolean;
  /** Explicit destructive flag (e.g. setProductRows full overwrite). */
  destructive?: boolean;
  /** Optional pre-check that returns a structured preview for two-phase confirm. */
  preCheck?: (client: Bitrix24ApiClient, args: Record<string, unknown>) => Promise<Record<string, unknown> | undefined>;
}

export function createActionTool(
  name: string,
  description: string,
  actionEnum: string[],
  paramSchema: Record<string, unknown>,
  mappings: Record<string, ActionMapping>,
  client: Bitrix24ApiClient,
  actionDescriptions?: Record<string, string>,
  transformResponse?: (action: string, data: unknown) => unknown,
): ToolDefinition {
  const actionDesc = actionDescriptions
    ? Object.entries(actionDescriptions).map(([k, v]) => `  - "${k}": ${v}`).join("\n")
    : `One of: ${actionEnum.join(", ")}`;

  return {
    name,
    description,
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: actionEnum, description: `Operation to perform:\n${actionDesc}` },
        confirm: { type: "boolean", description: "Set to true to confirm destructive actions when BX24_CONFIRM_DESTRUCTIVE is enabled." },
        ...paramSchema,
      },
      required: ["action"],
    },
    handler: async (args) => {
      const validationError = validateArgs(args, {
        properties: {
          action: { type: "string", enum: actionEnum },
          confirm: { type: "boolean" },
          ...paramSchema,
        },
        required: ["action"],
      });
      if (validationError) return errorResult(validationError);

      const action = args.action as string;
      const mapping = mappings[action];
      if (!mapping) {
        return errorResult(t(client.lang(), "unknownAction", { action, actions: Object.keys(mappings).join(", ") }));
      }

      if (mapping.pathParams) {
        for (const p of mapping.pathParams) {
          if (args[p] === undefined || args[p] === null) {
            return errorResult(t(client.lang(), "paramRequired", { param: p, action }));
          }
        }
      }

      // Two-phase destructive confirmation (§5 of spec).
      const destructive = isDestructiveAction(action, mapping);
      if (destructive && client.isConfirmDestructive() && !args.confirm) {
        let preview: Record<string, unknown> | undefined;
        try {
          if (mapping.preCheck) preview = await mapping.preCheck(client, args);
        } catch {
          // pre-check is best-effort; never block the confirmation flow
        }
        const ctx: ConfirmContext = {
          requiresConfirmation: true,
          description: t(client.lang(), "confirmRequired", { action, tool: name }),
          preview: preview ?? { action, tool: name, params: maskParams(args) },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(ctx, null, 2) }],
          isError: true,
        };
      }

      const requestParams = buildRequestParams(mapping, args, client.lang());
      if ("__error" in requestParams) {
        return errorResult(requestParams.__error as string);
      }

      const started = Date.now();
      let result: unknown;
      let resultStatus: "ok" | "error" = "ok";
      try {
        if (mapping.isList) {
          result = await client.list(mapping.restMethod, requestParams as Record<string, unknown>, mapping.httpVerb);
        } else {
          result = await client.callMethod(mapping.restMethod, requestParams as Record<string, unknown>, { httpVerb: mapping.httpVerb });
        }
      } catch (err) {
        resultStatus = "error";
        throw err;
      } finally {
        if (destructive) {
          client.recordDestructive({
            tool: name,
            action,
            restMethod: mapping.restMethod,
            params: maskParams(args),
            result: resultStatus,
            durationMs: Date.now() - started,
          });
        }
      }

      const transformed = transformResponse ? transformResponse(action, result) : result;
      return successResult(transformed);
    },
  };
}

function buildRequestParams(
  mapping: ActionMapping,
  args: Record<string, unknown>,
  lang: "ru" | "en",
): Record<string, unknown> | { __error: string } {
  if (mapping.emptyBody) return {};

  if (mapping.bodyParam) {
    const body = args[mapping.bodyParam];
    if (body === undefined || body === null) {
      return { __error: t(lang, "paramRequired", { param: mapping.bodyParam, action: args.action as string }) };
    }
    const payload = mapping.bodyWrapper ? { [mapping.bodyWrapper]: body } : (body as Record<string, unknown>);
    const merged: Record<string, unknown> = { ...payload };
    if (mapping.pathParams) {
      for (const p of mapping.pathParams) {
        if (args[p] !== undefined && args[p] !== null) merged[p] = args[p];
      }
    }
    return merged;
  }

  if (mapping.rawBody) {
    const reserved = new Set<string>(["action", "confirm"]);
    if (mapping.pathParams) mapping.pathParams.forEach((p) => reserved.add(p));
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (!reserved.has(key)) rest[key] = value;
    }
    return rest;
  }

  const params: Record<string, unknown> = {};
  if (mapping.pathParams) {
    for (const p of mapping.pathParams) {
      if (args[p] !== undefined && args[p] !== null) params[p] = args[p];
    }
  }
  if (mapping.queryParams) {
    for (const p of mapping.queryParams) {
      if (args[p] !== undefined && args[p] !== null) params[p] = args[p];
    }
  }
  return params;
}

// Mask obvious secret-like keys before writing params to logs/audit/preview.
const SECRET_RE = /(secret|token|password|webhook)/i;
function maskParams(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    out[k] = SECRET_RE.test(k) ? "***" : v;
  }
  return out;
}