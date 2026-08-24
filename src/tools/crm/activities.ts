import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createActivitiesTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_crm_activities",
    `Bitrix24 CRM activities (дела/звонки/встречи/письма): CRUD, complete, timeline, bindings, count. Methods crm.activity.*, crm.timeline.* (${API_VERSION}). RU/EN: дело, запланируй звонок, запланируй встречу, заверши дело / activity, plan a call, plan a meeting, complete activity.`,
    ["add", "get", "list", "update", "delete", "fields", "complete", "timeline_comment", "timeline_list", "binding_add", "binding_delete", "count"],
    {
      id: P.id, fields: { type: "object", description: "Activity fields: TYPE_ID, SUBJECT, DESCRIPTION, START_TIME, END_TIME, COMPLETED, OWNER_ID, OWNER_TYPE_ID, RESPONSIBLE_ID." },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      ownerId: P.ownerId, ownerTypeId: { type: "string", description: "Owner type: 1=lead,2=deal,3=contact,4=company" },
      comment: { type: "string", description: "Timeline comment text" },
    },
    {
      add: { restMethod: "crm.activity.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "crm.activity.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "crm.activity.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      update: { restMethod: "crm.activity.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "fields", bodyWrapper: "fields" },
      delete: { restMethod: "crm.activity.delete", httpVerb: "POST", pathParams: ["id"] },
      fields: { restMethod: "crm.activity.fields", httpVerb: "GET" },
      complete: { restMethod: "crm.activity.complete", httpVerb: "POST", pathParams: ["id"] },
      timeline_comment: { restMethod: "crm.timeline.comment.add", httpVerb: "POST", pathParams: ["ownerId"], bodyParam: "comment", bodyWrapper: "fields" },
      timeline_list: { restMethod: "crm.timeline.item.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order"] },
      binding_add: { restMethod: "crm.activity.binding.add", httpVerb: "POST", pathParams: ["id"], bodyParam: "ownerId", bodyWrapper: "fields" },
      binding_delete: { restMethod: "crm.activity.binding.delete", httpVerb: "POST", pathParams: ["id", "ownerId"] },
      count: { restMethod: "crm.activity.list", httpVerb: "GET", queryParams: ["filter", "select"] },
    },
    client,
    {
      add: "Create an activity (call/meeting/task). Bind with OWNER_ID + OWNER_TYPE_ID.",
      get: "Get an activity by ID", list: "List/filter activities", update: "Update an activity",
      delete: "Delete an activity (destructive)", fields: "Describe activity fields",
      complete: "Mark an activity completed", timeline_comment: "Add a timeline comment to an entity",
      timeline_list: "List timeline items", binding_add: "Bind an activity to an entity",
      binding_delete: "Remove a binding (destructive)", count: "Count activities by filter",
    },
  );
}