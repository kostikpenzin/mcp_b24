import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createContactsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_contacts",
    `Bitrix24 CRM contacts: CRUD, company bindings, user fields. Methods crm.contact.*, crm.contact.company.*, crm.contact.userfield.* (${API_VERSION}). RU/EN: контакт, найти контакт, создать контакт / contact, find contact, create contact.`,
    ["add", "get", "list", "update", "delete", "fields", "company_add", "company_delete", "company_list", "userfield_get", "userfield_add", "userfield_update", "userfield_delete"],
    {
      id: P.id, fields: { type: "object", description: "Contact fields: NAME, LAST_NAME, PHONE[], EMAIL[], COMPANY_ID, POST, ASSIGNED_BY_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      companyId: { type: "string", description: "Company ID" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition" },
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
      userfield_get: { restMethod: "crm.contact.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.contact.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.contact.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.contact.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
    },
    client,
    {
      add: "Create a contact", get: "Get a contact by ID", list: "List/filter contacts (by PHONE/EMAIL/NAME)",
      update: "Update contact fields", delete: "Delete a contact (destructive)", fields: "Describe contact fields",
      company_add: "Bind a company", company_delete: "Unbind a company (destructive)", company_list: "List companies bound to a contact",
      userfield_get: "Get a custom contact field", userfield_add: "Create a custom contact field",
      userfield_update: "Update a custom contact field", userfield_delete: "Delete a custom contact field (destructive)",
    },
  );
}