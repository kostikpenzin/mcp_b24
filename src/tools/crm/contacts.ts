import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createContactsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_contacts",
    `Bitrix24 CRM contacts: CRUD, company bindings, user fields. Methods crm.contact.*, crm.contact.company.*, crm.contact.userfield.* (${API_VERSION}). RU/EN: контакт, найти контакт, создать контакт / contact, find contact, create contact.`,
    ["add", "get", "list", "update", "delete", "fields", "company_add", "company_delete", "company_list", "company_items_set", "company_items_delete", "userfield_get", "userfield_add", "userfield_update", "userfield_delete", "details_get", "details_set", "details_reset"],
    {
      id: P.id, fields: { type: "object", description: "Contact fields: NAME, LAST_NAME, PHONE[], EMAIL[], COMPANY_ID, POST, ASSIGNED_BY_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      companyId: { type: "string", description: "Company ID" },
      companyIds: { type: "array", items: { type: "string" }, description: "Company IDs to set" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition" },
      configFields: { type: "object", description: "Contact card configuration (details.configuration.*) fields" },
    },
    {
      add: { restMethod: "crm.contact.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.contact.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.contact.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.contact.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.contact.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.contact.fields", httpVerb: "GET" },
      company_add: { restMethod: "crm.contact.company.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "companyId", bodyWrapper: "fields" },
      company_delete: { restMethod: "crm.contact.company.delete", httpVerb: "POST", pathParams: ["id", "companyId"] },
      company_list: { restMethod: "crm.contact.company.items.get", httpVerb: "GET", pathParams: ["id"] },
      company_items_set: { restMethod: "crm.contact.company.items.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "companyIds", bodyWrapper: "items" },
      company_items_delete: { restMethod: "crm.contact.company.items.delete", httpVerb: "POST", pathParams: ["id"], bodyParam: "companyIds", bodyWrapper: "items", destructive: true },
      userfield_get: { restMethod: "crm.contact.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.contact.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.contact.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.contact.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
      details_get: { restMethod: "crm.contact.details.configuration.get", httpVerb: "GET" },
      details_set: { restMethod: "crm.contact.details.configuration.set", httpVerb: "POST", bodyParam: "configFields", bodyWrapper: "fields" },
      details_reset: { restMethod: "crm.contact.details.configuration.reset", httpVerb: "POST" },
    },
    client,
    {
      add: "Create a contact", get: "Get a contact by ID", list: "List/filter contacts (by PHONE/EMAIL/NAME)",
      update: "Update contact fields", delete: "Delete a contact (destructive)", fields: "Describe contact fields",
      company_add: "Bind a company", company_delete: "Unbind a company (destructive)", company_list: "List companies bound to a contact",
      company_items_set: "Set the full set of companies on a contact", company_items_delete: "Clear all companies from a contact (destructive)",
      userfield_get: "Get a custom contact field", userfield_add: "Create a custom contact field",
      userfield_update: "Update a custom contact field", userfield_delete: "Delete a custom contact field (destructive)",
      details_get: "Get contact card configuration (layout)", details_set: "Set contact card configuration", details_reset: "Reset contact card configuration to default",
    },
  );
}