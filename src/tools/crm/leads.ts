import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createLeadsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_leads",
    `Bitrix24 CRM leads: CRUD, fields, contacts, user fields. Methods crm.lead.* (${API_VERSION}). RU/EN: лид, новый лид, создать лид, найди лиды, обнови лид, удали лид / lead, create lead, find leads, update lead, delete lead.`,
    ["add", "get", "list", "update", "delete", "fields", "contact_get", "contact_add", "contact_delete", "contact_items_set", "contact_items_delete", "userfield_get", "userfield_add", "userfield_update", "userfield_delete", "convert", "productrows_get", "productrows_set", "details_get", "details_set", "details_reset"],
    {
      id: P.id, fields: { type: "object", description: "Lead fields: TITLE (required), NAME, LAST_NAME, PHONE[], EMAIL[], COMPANY_TITLE, STATUS_ID, SOURCE_ID, ASSIGNED_BY_ID. Use action=fields for the full list." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      contactId: { type: "string", description: "Contact ID bound to the lead" },
      contactIds: { type: "array", items: { type: "string" }, description: "Contact IDs to set" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition: FIELD_NAME, USER_TYPE_ID, LABEL, ..." },
      rows: { type: "array", items: { type: "object" }, description: "Product row array: {PRODUCT_ID, PRICE, QUANTITY, ...}" },
      configFields: { type: "object", description: "Lead card configuration (details.configuration.*) fields" },
    },
    {
      add: { restMethod: "crm.lead.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.lead.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.lead.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.lead.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.lead.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.lead.fields", httpVerb: "GET" },
      contact_get: { restMethod: "crm.lead.contact.items.get", httpVerb: "GET", pathParams: ["id"] },
      contact_add: { restMethod: "crm.lead.contact.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      contact_delete: { restMethod: "crm.lead.contact.delete", httpVerb: "POST", pathParams: ["id", "contactId"] },
      contact_items_set: { restMethod: "crm.lead.contact.items.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items" },
      contact_items_delete: { restMethod: "crm.lead.contact.items.delete", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items", destructive: true },
      userfield_get: { restMethod: "crm.lead.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.lead.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.lead.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.lead.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
      convert: { restMethod: "crm.lead.convert", httpVerb: "POST", pathParams: ["id"] },
      productrows_get: { restMethod: "crm.lead.productrows.get", httpVerb: "GET", pathParams: ["id"] },
      productrows_set: { restMethod: "crm.lead.productrows.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "rows", bodyWrapper: "rows", destructive: true },
      details_get: { restMethod: "crm.lead.details.configuration.get", httpVerb: "GET" },
      details_set: { restMethod: "crm.lead.details.configuration.set", httpVerb: "POST", bodyParam: "configFields", bodyWrapper: "fields" },
      details_reset: { restMethod: "crm.lead.details.configuration.reset", httpVerb: "POST" },
    },
    client,
    {
      add: "Create a lead (TITLE required)",
      get: "Get a lead by ID",
      list: "List/filter leads",
      update: "Update lead fields by ID",
      delete: "Delete a lead (destructive)",
      fields: "Describe all lead fields — call first when unsure",
      contact_get: "List contacts bound to a lead",
      contact_add: "Bind a contact to a lead",
      contact_delete: "Unbind a contact (destructive)",
      contact_items_set: "Set the full set of contacts on a lead",
      contact_items_delete: "Clear all contacts from a lead (destructive)",
      userfield_get: "Get a custom lead field",
      userfield_add: "Create a custom lead field",
      userfield_update: "Update a custom lead field",
      userfield_delete: "Delete a custom lead field (destructive)",
      convert: "Convert a lead to a deal/contact",
      productrows_get: "Get lead product rows",
      productrows_set: "Overwrite lead product rows (destructive — full rewrite)",
      details_get: "Get lead card configuration (layout)",
      details_set: "Set lead card configuration",
      details_reset: "Reset lead card configuration to default",
    },
  );
}