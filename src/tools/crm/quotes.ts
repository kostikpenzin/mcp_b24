import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createQuotesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_quotes",
    `Bitrix24 CRM quotes (коммерческие предложения): CRUD, product rows, contact bindings, user fields. Methods crm.quote.*, crm.quote.productrows.*, crm.quote.contact.*, crm.quote.userfield.* (${API_VERSION}). RU/EN: коммерческое предложение, КП, создать КП / quote, create quote, proposal.`,
    ["add", "get", "list", "update", "delete", "fields", "productrows_get", "productrows_set", "contact_add", "contact_delete", "contact_items_get", "contact_items_set", "userfield_get", "userfield_add", "userfield_update", "userfield_delete"],
    {
      id: P.quoteId,
      fields: { type: "object", description: "Quote fields: TITLE (required), OPPORTUNITY, CURRENCY_ID, COMPANY_ID, CONTACT_ID, ASSIGNED_BY_ID, STATUS_ID, CLOSED." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      contactId: P.contactId,
      contactIds: { type: "array", items: { type: "string" }, description: "Contact IDs to bind" },
      rows: { type: "array", items: { type: "object" }, description: "Product row array: {PRODUCT_ID, PRICE, QUANTITY, ...}" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition: FIELD_NAME, USER_TYPE_ID, LABEL" },
    },
    {
      add: { restMethod: "crm.quote.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.quote.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.quote.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.quote.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.quote.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.quote.fields", httpVerb: "GET" },
      productrows_get: { restMethod: "crm.quote.productrows.get", httpVerb: "GET", pathParams: ["id"] },
      productrows_set: { restMethod: "crm.quote.productrows.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "rows", bodyWrapper: "rows", destructive: true },
      contact_add: { restMethod: "crm.quote.contact.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactId", bodyWrapper: "fields" },
      contact_delete: { restMethod: "crm.quote.contact.delete", httpVerb: "POST", pathParams: ["id", "contactId"] },
      contact_items_get: { restMethod: "crm.quote.contact.items.get", httpVerb: "GET", pathParams: ["id"] },
      contact_items_set: { restMethod: "crm.quote.contact.items.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items" },
      userfield_get: { restMethod: "crm.quote.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.quote.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.quote.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.quote.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
    },
    client,
    {
      add: "Create a quote (TITLE required)", get: "Get a quote by ID", list: "List/filter quotes",
      update: "Update quote fields", delete: "Delete a quote (destructive)", fields: "Describe quote fields",
      productrows_get: "Get quote product rows", productrows_set: "Overwrite quote product rows (destructive — full rewrite)",
      contact_add: "Bind a contact to a quote", contact_delete: "Unbind a contact (destructive)",
      contact_items_get: "List contacts bound to a quote", contact_items_set: "Set contact bindings",
      userfield_get: "Get a custom quote field", userfield_add: "Create a custom quote field",
      userfield_update: "Update a custom quote field", userfield_delete: "Delete a custom quote field (destructive)",
    },
  );
}