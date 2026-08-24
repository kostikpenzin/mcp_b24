import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createConfTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_conf",
    `Bitrix24 video conferences (Zoom-аналог). Methods im.conference.* (${API_VERSION}). RU/EN: конференция, видеовстреча, собери созвон / conference, video call, schedule call.`,
    ["create", "get", "list", "delete", "join", "leave"],
    {
      id: P.id, fields: { type: "object", description: "Conference fields: TITLE, USERS, CONFERENCE_LINK, PASSWORD" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
      userId: P.userId,
    },
    {
      create: { restMethod: "im.conference.create", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "im.conference.get", httpVerb: "GET", pathParams: ["id"] },
      list: { restMethod: "im.conference.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      delete: { restMethod: "im.conference.delete", httpVerb: "POST", pathParams: ["id"] },
      join: { restMethod: "im.conference.join", httpVerb: "POST", pathParams: ["id"] },
      leave: { restMethod: "im.conference.leave", httpVerb: "POST", pathParams: ["id"] },
    },
    client,
    {
      create: "Create a video conference (TITLE, USERS)", get: "Get a conference by ID", list: "List conferences",
      delete: "Delete a conference (destructive)", join: "Join a conference", leave: "Leave a conference",
    },
  );
}