import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createAddressesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_addresses",
    `Bitrix24 CRM addresses (адреса клиентов): CRUD, by client, delete by filter. Methods crm.address.*, crm.address.byclient (${API_VERSION}). RU/EN: адрес, адрес клиента, фактический адрес, юридический адрес / address, client address, actual address, legal address.`,
    ["add", "get", "list", "update", "delete", "fields", "byclient", "deleteByFilter"],
    {
      id: P.id,
      fields: { type: "object", description: "Address fields: TYPE_ID (1=actual,6=legal,8=registration), ENTITY_TYPE_ID, ENTITY_ID, ADDRESS_1, CITY, POSTAL_CODE, COUNTRY, REGION, ..." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      clientId: { type: "string", description: "Client (entity) ID for byclient" },
      clientTypeId: { type: "string", description: "Client entity type ID for byclient" },
    },
    {
      add: { restMethod: "crm.address.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.address.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.address.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.address.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.address.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.address.fields", httpVerb: "GET" },
      byclient: { restMethod: "crm.address.byclient", httpVerb: "GET", queryParams: ["clientTypeId", "clientId"] },
      deleteByFilter: { restMethod: "crm.address.deleteByFilter", httpVerb: "POST", bodyParam: "filter", bodyWrapper: "filter", destructive: true },
    },
    client,
    {
      add: "Create an address", get: "Get an address by ID", list: "List addresses",
      update: "Update an address", delete: "Delete an address (destructive)", fields: "Describe address fields",
      byclient: "Get addresses of a client (by entity type + ID)",
      deleteByFilter: "Delete addresses matching a filter (destructive — bulk)",
    },
  );
}