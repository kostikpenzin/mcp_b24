import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createCurrencyTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_currency",
    `Bitrix24 CRM currencies (валюты): CRUD, base currency, localizations. Methods crm.currency.*, crm.currency.base.*, crm.currency.localizations.* (${API_VERSION}). RU/EN: валюта, курс, базовая валюта, локализация / currency, base currency, localization.`,
    ["add", "get", "list", "update", "delete", "fields", "base_get", "base_set", "localizations_get", "localizations_set", "localizations_delete", "localizations_fields"],
    {
      id: P.currencyId,
      fields: { type: "object", description: "Currency fields: CURRENCY (code, e.g. RUB), AMOUNT, AMOUNT_CNT, DECIMALS, DEC_POINT, THOUSANDS_SEP, LANG, FORMAT_STRING, FULL_NAME." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      localizationFields: { type: "object", description: "Localization fields: FULL_NAME, DEC_POINT, THOUSANDS_SEP, FORMAT_STRING, ..." },
    },
    {
      add: { restMethod: "crm.currency.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.currency.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.currency.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.currency.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.currency.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.currency.fields", httpVerb: "GET" },
      base_get: { restMethod: "crm.currency.base.get", httpVerb: "GET" },
      base_set: { restMethod: "crm.currency.base.set", httpVerb: "POST", bodyParam: "id", bodyWrapper: "currencyId" },
      localizations_get: { restMethod: "crm.currency.localizations.get", httpVerb: "GET" },
      localizations_set: { restMethod: "crm.currency.localizations.set", httpVerb: "POST", bodyParam: "localizationFields", bodyWrapper: "fields" },
      localizations_delete: { restMethod: "crm.currency.localizations.delete", httpVerb: "POST", pathParams: ["id"] },
      localizations_fields: { restMethod: "crm.currency.localizations.fields", httpVerb: "GET" },
    },
    client,
    {
      add: "Create a currency", get: "Get a currency by code", list: "List currencies",
      update: "Update currency fields", delete: "Delete a currency (destructive)", fields: "Describe currency fields",
      base_get: "Get the base currency", base_set: "Set the base currency",
      localizations_get: "Get currency localizations", localizations_set: "Set currency localizations",
      localizations_delete: "Delete currency localizations (destructive)", localizations_fields: "Describe localization fields",
    },
  );
}