import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createTelephonyTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_telephony",
    `Bitrix24 telephony: external lines, external calls, SIP, voximplant, call follow-up. Methods telephony.externalLine.*, telephony.externalCall.*, voximplant.*, call.followup.* (${API_VERSION}). RU/EN: телефония, внешняя линия, звонок, SIP, воксимплант, перезвон / telephony, external line, call, sip, follow-up.`,
    ["externalLine_add", "externalLine_delete", "externalLine_list", "externalCall_register", "externalCall_finish", "externalCall_search", "sip_add", "sip_delete", "sip_list", "call_followup_get", "voximplant_info", "voximplant_call_search"],
    {
      id: P.id, fields: { type: "object", description: "Line/call fields (NUMBER, LINE_NUMBER, USER_ID, CALL_ID, ...)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      externalLine_add: { restMethod: "telephony.externalLine.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      externalLine_delete: { restMethod: "telephony.externalLine.delete", httpVerb: "POST", pathParams: ["id"] },
      externalLine_list: { restMethod: "telephony.externalLine.list", httpVerb: "GET" },
      externalCall_register: { restMethod: "telephony.externalCall.register", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      externalCall_finish: { restMethod: "telephony.externalCall.finish", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      externalCall_search: { restMethod: "telephony.externalCall.search", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      sip_add: { restMethod: "voximplant.sip.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      sip_delete: { restMethod: "voximplant.sip.delete", httpVerb: "POST", pathParams: ["id"] },
      sip_list: { restMethod: "voximplant.sip.list", httpVerb: "GET" },
      call_followup_get: { restMethod: "call.followup.get", httpVerb: "GET", isList: true, queryParams: ["filter"] },
      voximplant_info: { restMethod: "voximplant.info", httpVerb: "GET" },
      voximplant_call_search: { restMethod: "voximplant.call.search", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
    },
    client,
    {
      externalLine_add: "Add an external line", externalLine_delete: "Delete an external line (destructive)", externalLine_list: "List external lines",
      externalCall_register: "Register an external call", externalCall_finish: "Finish an external call",
      externalCall_search: "Search external call history",
      sip_add: "Add a SIP line", sip_delete: "Delete a SIP line (destructive)", sip_list: "List SIP lines",
      call_followup_get: "Get call follow-ups", voximplant_info: "Get VoxImplant account info",
      voximplant_call_search: "Search VoxImplant calls",
    },
  );
}