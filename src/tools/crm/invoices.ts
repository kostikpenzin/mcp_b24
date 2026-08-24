import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { errorResult, successResult } from "../../error.js";
import { validateArgs } from "../validate.js";
import { P } from "../params.js";
import { t } from "../../i18n/index.js";
import { API_VERSION } from "../../constants.js";

// SMART_INVOICE is accessed via crm.item.* with entityTypeId = 31. Every request
// must carry entityTypeId, so this is a custom (non-framework) tool that injects it.
const INVOICE_ENTITY_TYPE_ID = 31;

const ACTIONS = ["add", "get", "list", "update", "delete", "fields", "stage_list", "getProductRows", "setProductRows", "addProductRow"] as const;
type Action = (typeof ACTIONS)[number];

const DESTRUCTIVE = new Set<Action>(["delete", "setProductRows"]);

export function createInvoicesTool(client: Bitrix24ApiClient): ToolDefinition {
  return {
    name: "bx24_crm_invoices",
    description: `Bitrix24 CRM invoices (SMART_INVOICE): CRUD, stages, product rows. Methods crm.item.* (entityTypeId=31), crm.status.* (${API_VERSION}). RU/EN: счёт, создать счёт, найти счета / invoice, create invoice, find invoices.`,
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: [...ACTIONS], description: "Operation to perform (entityTypeId=31 is injected automatically)." },
        confirm: { type: "boolean", description: "Confirm destructive actions (delete, setProductRows)." },
        id: P.id,
        fields: { type: "object", description: "Invoice fields. Use action=fields to list them." },
        filter: P.filter, select: P.select, order: P.order, start: P.start,
        rows: { type: "array", items: { type: "object" }, description: "Product rows: {PRODUCT_ID, PRICE, QUANTITY}" },
        row: { type: "object", description: "Single product row" },
      },
      required: ["action"],
    },
    handler: async (args): Promise<ToolResult> => {
      const err = validateArgs(args, {
        properties: {
          action: { type: "string", enum: [...ACTIONS] },
          confirm: { type: "boolean" },
          id: { type: "string" }, fields: { type: "object" },
          filter: { type: "object" }, select: { type: "array" }, order: { type: "object" }, start: { type: "integer" },
          rows: { type: "array" }, row: { type: "object" },
        },
        required: ["action"],
      });
      if (err) return errorResult(err);

      const action = args.action as Action;
      const destructive = DESTRUCTIVE.has(action);
      if (destructive && client.isConfirmDestructive() && !args.confirm) {
        return {
          content: [{ type: "text", text: t(client.lang(), "confirmRequired", { action, tool: "bx24_crm_invoices" }) }],
          isError: true,
        };
      }

      const params: Record<string, unknown> = { entityTypeId: INVOICE_ENTITY_TYPE_ID };
      if (action === "add") {
        if (!args.fields) return errorResult(t(client.lang(), "paramRequired", { param: "fields", action }));
        params.fields = args.fields;
      } else if (action === "update") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        params.id = args.id;
        if (args.fields) params.fields = args.fields;
      } else if (action === "get" || action === "delete") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        params.id = args.id;
      } else if (action === "list") {
        for (const k of ["filter", "select", "order", "start"]) if (args[k] != null) params[k] = args[k];
      } else if (action === "setProductRows") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        params.id = args.id;
        params.rows = args.rows;
      } else if (action === "addProductRow") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        params.id = args.id;
        params.row = args.row;
      } else if (action === "getProductRows") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        params.ownerId = args.id;
      }
      // stage_list / fields: only entityTypeId (fields actually doesn't need it, harmless)

      const restMethod =
        action === "stage_list" ? "crm.status.list"
        : action === "getProductRows" ? "crm.item.productrow.list"
        : action === "setProductRows" ? "crm.item.productrow.set"
        : action === "addProductRow" ? "crm.item.productrow.add"
        : `crm.item.${action}`;

      const started = Date.now();
      let result: unknown;
      try {
        if (action === "list") {
          result = await client.list(restMethod, params, "GET");
        } else {
          result = await client.callMethod(restMethod, params, { httpVerb: "POST" });
        }
      } finally {
        if (destructive) {
          client.recordDestructive({ tool: "bx24_crm_invoices", action, restMethod, result: "ok", durationMs: Date.now() - started });
        }
      }
      return successResult(result);
    },
  };
}