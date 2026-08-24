import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createWebformTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_webform",
    `Bitrix24 CRM webforms (веб-формы) & results: form CRUD, results, options. Methods crm.webform.*, crm.webform.result.*, crm.webform.option.* (${API_VERSION}). RU/EN: веб-форма, форма обратной связи, результат, заявка с сайта / webform, feedback form, result, lead form.`,
    [
      "add", "get", "list", "update", "delete", "fields",
      "result_add", "result_list", "result_get", "result_delete", "result_fields",
      "option_list", "option_add", "option_update", "option_delete", "option_get",
    ],
    {
      id: P.webformId,
      resultId: P.resultId,
      fields: { type: "object", description: "Webform/result/option fields (per Bitrix24 docs for the method)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      add: { restMethod: "crm.webform.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.webform.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.webform.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.webform.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.webform.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.webform.fields", httpVerb: "GET" },
      result_add: { restMethod: "crm.webform.result.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      result_list: { restMethod: "crm.webform.result.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      result_get: { restMethod: "crm.webform.result.get", httpVerb: "GET", pathParams: ["resultId"] },
      result_delete: { restMethod: "crm.webform.result.delete", httpVerb: "POST", pathParams: ["resultId"] },
      result_fields: { restMethod: "crm.webform.result.fields", httpVerb: "GET" },
      option_list: { restMethod: "crm.webform.option.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      option_add: { restMethod: "crm.webform.option.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      option_update: { restMethod: "crm.webform.option.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      option_delete: { restMethod: "crm.webform.option.delete", httpVerb: "POST", pathParams: ["id"] },
      option_get: { restMethod: "crm.webform.option.get", httpVerb: "GET", pathParams: ["id"] },
    },
    client,
    {
      add: "Create a CRM webform", get: "Get a webform by ID", list: "List webforms",
      update: "Update a webform", delete: "Delete a webform (destructive)", fields: "Describe webform fields",
      result_add: "Add a webform result (form submission)", result_list: "List webform results",
      result_get: "Get a webform result", result_delete: "Delete a webform result (destructive)", result_fields: "Describe result fields",
      option_list: "List webform options", option_add: "Add a webform option",
      option_update: "Update a webform option", option_delete: "Delete a webform option (destructive)", option_get: "Get a webform option",
    },
  );
}