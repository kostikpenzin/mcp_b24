import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createDealsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_deals",
    `Bitrix24 CRM deals: CRUD, funnels/categories, product rows, contact bindings, timeline. Methods crm.deal.*, crm.dealcategory.*, crm.deal.productrows.*, crm.deal.contact.* (${API_VERSION}). RU/EN: сделка, создать сделку, найди сделки, передвинуть по воронке, закрыть сделку, товарные позиции / deal, create deal, find deals, move stage, close deal, product rows.`,
    ["add", "get", "list", "update", "delete", "fields", "category_list", "category_add", "category_update", "category_delete", "getProductRows", "setProductRows", "addProductRow", "getContactBindings", "setContactBindings", "getByCategory", "moveToCategory", "count"],
    {
      id: P.id, fields: { type: "object", description: "Deal fields: TITLE (required), STAGE_ID, CATEGORY_ID, OPPORTUNITY, CURRENCY_ID, COMPANY_ID, CONTACT_ID, ASSIGNED_BY_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      categoryId: { type: "string", description: "Pipeline/category ID" },
      categoryFields: { type: "object", description: "Category fields: NAME" },
      rows: { type: "array", items: { type: "object" }, description: "Product row array: {PRODUCT_ID, PRICE, QUANTITY, ...}" },
      row: { type: "object", description: "Single product row" },
      contactIds: { type: "array", items: { type: "string" }, description: "Contact IDs to bind" },
    },
    {
      add: { restMethod: "crm.deal.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.deal.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.deal.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.deal.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.deal.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.deal.fields", httpVerb: "GET" },
      category_list: { restMethod: "crm.dealcategory.list", httpVerb: "GET" },
      category_add: { restMethod: "crm.dealcategory.add", httpVerb: "POST", bodyParam: "categoryFields", bodyWrapper: "fields" },
      category_update: { restMethod: "crm.dealcategory.update", httpVerb: "POST", pathParams: ["categoryId"], bodyParam: "categoryFields", bodyWrapper: "fields" },
      category_delete: { restMethod: "crm.dealcategory.delete", httpVerb: "POST", pathParams: ["categoryId"] },
      getProductRows: { restMethod: "crm.deal.productrows.get", httpVerb: "GET", pathParams: ["id"] },
      setProductRows: { restMethod: "crm.deal.productrows.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "rows", bodyWrapper: "rows", destructive: true },
      addProductRow: { restMethod: "crm.deal.productrows.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "row", bodyWrapper: "row" },
      getContactBindings: { restMethod: "crm.deal.contact.items.get", httpVerb: "GET", pathParams: ["id"] },
      setContactBindings: { restMethod: "crm.deal.contact.items.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items" },
      getByCategory: { restMethod: "crm.deal.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      moveToCategory: { restMethod: "crm.deal.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "categoryId", bodyWrapper: "fields" },
      count: { restMethod: "crm.deal.list", httpVerb: "GET", queryParams: ["filter", "select"] },
    },
    client,
    {
      add: "Create a deal (TITLE required)",
      get: "Get a deal by ID",
      list: "List/filter deals",
      update: "Update deal fields by ID (set STAGE_ID to move/close)",
      delete: "Delete a deal (destructive)",
      fields: "Describe all deal fields",
      category_list: "List deal pipelines/categories (воронки)",
      category_add: "Create a pipeline/category",
      category_update: "Update a pipeline/category",
      category_delete: "Delete a pipeline/category (destructive)",
      getProductRows: "Get product rows of a deal",
      setProductRows: "Overwrite product rows (destructive — full rewrite)",
      addProductRow: "Add a product row to a deal",
      getContactBindings: "List contacts bound to a deal",
      setContactBindings: "Set contact bindings",
      getByCategory: "List deals by category (filter by CATEGORY_ID)",
      moveToCategory: "Move a deal to another category (set CATEGORY_ID)",
      count: "Count deals matching filter (returns total)",
    },
  );
}