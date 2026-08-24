import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { errorResult, successResult } from "../../error.js";
import { validateArgs } from "../validate.js";
import { P } from "../params.js";
import { t } from "../../i18n/index.js";
import { API_VERSION } from "../../constants.js";

// Smart processes: crm.type.* for the type itself; crm.item.* for items of a type.
// Item operations require entityTypeId (the type ID), so this is a custom tool.
const ACTIONS = ["type_list", "type_get", "type_add", "type_update", "type_delete", "item_list", "item_get", "item_add", "item_update", "item_delete"] as const;
type Action = (typeof ACTIONS)[number];
const DESTRUCTIVE = new Set<Action>(["type_delete", "item_delete"]);

export function createSmartProcessesTool(client: Bitrix24ApiClient): ToolDefinition {
  return {
    name: "bx24_smart_processes",
    description: `Bitrix24 smart processes (произвольные CRM-сущности): types + items CRUD. Methods crm.type.*, crm.item.* (${API_VERSION}). RU/EN: умный процесс, смарт-процесс, произвольная сущность, создать тип, элемент / smart process, custom entity, type, item.`,
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: [...ACTIONS], description: "type_* manage smart-process types; item_* manage items (requires entityTypeId=type id)." },
        confirm: { type: "boolean", description: "Confirm destructive actions (type_delete, item_delete)." },
        typeId: { type: "string", description: "Smart-process type ID (used as entityTypeId for item operations)" },
        id: P.id,
        typeFields: { type: "object", description: "Type fields: title, code, ..." },
        fields: { type: "object", description: "Item fields for the smart process" },
        filter: P.filter, select: P.select, order: P.order, start: P.start,
      },
      required: ["action"],
    },
    handler: async (args): Promise<ToolResult> => {
      const err = validateArgs(args, {
        properties: {
          action: { type: "string", enum: [...ACTIONS] }, confirm: { type: "boolean" },
          typeId: { type: "string" }, id: { type: "string" }, typeFields: { type: "object" }, fields: { type: "object" },
          filter: { type: "object" }, select: { type: "array" }, order: { type: "object" }, start: { type: "integer" },
        },
        required: ["action"],
      });
      if (err) return errorResult(err);

      const action = args.action as Action;
      if (DESTRUCTIVE.has(action) && client.isConfirmDestructive() && !args.confirm) {
        return { content: [{ type: "text", text: t(client.lang(), "confirmRequired", { action, tool: "bx24_smart_processes" }) }], isError: true };
      }

      if (action.startsWith("item_") && !args.typeId) {
        return errorResult(t(client.lang(), "paramRequired", { param: "typeId", action }));
      }

      let restMethod: string;
      const params: Record<string, unknown> = {};

      if (action === "type_list") { restMethod = "crm.type.list"; }
      else if (action === "type_get") {
        if (!args.typeId) return errorResult(t(client.lang(), "paramRequired", { param: "typeId", action }));
        restMethod = "crm.type.get"; params.id = args.typeId;
      } else if (action === "type_add") {
        restMethod = "crm.type.add"; if (!args.typeFields) return errorResult(t(client.lang(), "paramRequired", { param: "typeFields", action }));
        params.fields = args.typeFields;
      } else if (action === "type_update") {
        if (!args.typeId) return errorResult(t(client.lang(), "paramRequired", { param: "typeId", action }));
        restMethod = "crm.type.update"; params.id = args.typeId; if (args.typeFields) params.fields = args.typeFields;
      } else if (action === "type_delete") {
        if (!args.typeId) return errorResult(t(client.lang(), "paramRequired", { param: "typeId", action }));
        restMethod = "crm.type.delete"; params.id = args.typeId;
      } else if (action === "item_list") {
        restMethod = "crm.item.list"; params.entityTypeId = args.typeId;
        for (const k of ["filter", "select", "order", "start"]) if (args[k] != null) params[k] = args[k];
      } else if (action === "item_get") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        restMethod = "crm.item.get"; params.entityTypeId = args.typeId; params.id = args.id;
      } else if (action === "item_add") {
        restMethod = "crm.item.add"; params.entityTypeId = args.typeId;
        if (!args.fields) return errorResult(t(client.lang(), "paramRequired", { param: "fields", action }));
        params.fields = args.fields;
      } else if (action === "item_update") {
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        restMethod = "crm.item.update"; params.entityTypeId = args.typeId; params.id = args.id;
        if (args.fields) params.fields = args.fields;
      } else { // item_delete
        if (!args.id) return errorResult(t(client.lang(), "paramRequired", { param: "id", action }));
        restMethod = "crm.item.delete"; params.entityTypeId = args.typeId; params.id = args.id;
      }

      const started = Date.now();
      let result: unknown;
      try {
        if (action === "type_list" || action === "item_list") {
          result = await client.list(restMethod, params, "GET");
        } else {
          result = await client.callMethod(restMethod, params, { httpVerb: "POST" });
        }
      } finally {
        if (DESTRUCTIVE.has(action)) {
          client.recordDestructive({ tool: "bx24_smart_processes", action, restMethod, result: "ok", durationMs: Date.now() - started });
        }
      }
      return successResult(result);
    },
  };
}