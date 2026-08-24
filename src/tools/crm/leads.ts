import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createLeadsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_leads",
    `Bitrix24 CRM leads: CRUD, fields, contacts, user fields. Methods crm.lead.* (${API_VERSION}). RU/EN: лид, новый лид, создать лид, найди лиды, обнови лид, удали лид / lead, create lead, find leads, update lead, delete lead.`,
    ["add", "get", "list", "update", "delete", "fields", "contact_get", "contact_add", "contact_delete", "userfield_get", "userfield_add", "userfield_update", "userfield_delete", "convert"],
    {
      id: P.id, fields: { type: "object", description: "Lead fields: TITLE (required), NAME, LAST_NAME, PHONE[], EMAIL[], COMPANY_TITLE, STATUS_ID, SOURCE_ID, ASSIGNED_BY_ID. Use action=fields for the full list." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      contactId: { type: "string", description: "Contact ID bound to the lead" },
      userfieldId: P.userfieldId, userfield: { type: "object", description: "User field definition: FIELD_NAME, USER_TYPE_ID, LABEL, ..." },
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
      userfield_get: { restMethod: "crm.lead.userfield.get", httpVerb: "GET", pathParams: ["userfieldId"] },
      userfield_add: { restMethod: "crm.lead.userfield.add", httpVerb: "POST", bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_update: { restMethod: "crm.lead.userfield.update", httpVerb: "POST", pathParams: ["userfieldId"], bodyParam: "userfield", bodyWrapper: "fields" },
      userfield_delete: { restMethod: "crm.lead.userfield.delete", httpVerb: "POST", pathParams: ["userfieldId"] },
      convert: { restMethod: "crm.lead.convert", httpVerb: "POST", pathParams: ["id"] },
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
      userfield_get: "Get a custom lead field",
      userfield_add: "Create a custom lead field",
      userfield_update: "Update a custom lead field",
      userfield_delete: "Delete a custom lead field (destructive)",
      convert: "Convert a lead to a deal/contact",
    },
  );
}