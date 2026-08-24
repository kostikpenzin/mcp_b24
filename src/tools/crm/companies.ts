import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createCompaniesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_companies",
    `Bitrix24 CRM companies: CRUD, contact bindings, user fields. Methods crm.company.*, crm.company.contact.*, crm.company.userfield.* (${API_VERSION}). RU/EN: компания, создать компанию, найти компанию / company, create company, find company.`,
    ["add", "get", "list", "update", "delete", "fields", "contact_add", "contact_delete", "contact_list", "contact_items_set", "contact_items_delete", "userfield_get", "userfield_add", "userfield_update", "userfield_delete", "details_get", "details_set", "details_reset"],
    {
      id: P.id, fields: { type: "object", description: "Company fields: TITLE (required), PHONE[], EMAIL[], INDUSTRY, REVENUE, COMPANY_TYPE, ASSIGNED_BY_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      contactId: { type: "string", description: "Contact ID" },
      contactIds: { type: "array", items: { type: "string" }, description: "Contact IDs to set" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition" },
      configFields: { type: "object", description: "Company card configuration (details.configuration.*) fields" },
    },
    {
      add: { restMethod: "crm.company.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.company.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.company.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.company.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.company.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.company.fields", httpVerb: "GET" },
      contact_add: { restMethod: "crm.company.contact.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactId", bodyWrapper: "fields" },
      contact_delete: { restMethod: "crm.company.contact.delete", httpVerb: "POST", pathParams: ["id", "contactId"] },
      contact_list: { restMethod: "crm.company.contact.items.get", httpVerb: "GET", pathParams: ["id"] },
      contact_items_set: { restMethod: "crm.company.contact.items.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items" },
      contact_items_delete: { restMethod: "crm.company.contact.items.delete", httpVerb: "POST", pathParams: ["id"], bodyParam: "contactIds", bodyWrapper: "items", destructive: true },
      userfield_get: { restMethod: "crm.company.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.company.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.company.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.company.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
      details_get: { restMethod: "crm.company.details.configuration.get", httpVerb: "GET" },
      details_set: { restMethod: "crm.company.details.configuration.set", httpVerb: "POST", bodyParam: "configFields", bodyWrapper: "fields" },
      details_reset: { restMethod: "crm.company.details.configuration.reset", httpVerb: "POST" },
    },
    client,
    {
      add: "Create a company (TITLE required)", get: "Get a company by ID", list: "List/filter companies",
      update: "Update company fields", delete: "Delete a company (destructive)", fields: "Describe company fields",
      contact_add: "Bind a contact", contact_delete: "Unbind a contact (destructive)", contact_list: "List contacts bound to a company",
      contact_items_set: "Set the full set of contacts on a company", contact_items_delete: "Clear all contacts from a company (destructive)",
      userfield_get: "Get a custom company field", userfield_add: "Create a custom company field",
      userfield_update: "Update a custom company field", userfield_delete: "Delete a custom company field (destructive)",
      details_get: "Get company card configuration (layout)", details_set: "Set company card configuration", details_reset: "Reset company card configuration to default",
    },
  );
}