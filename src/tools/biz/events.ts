import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createEventsTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_events",
    `Bitrix24 event subscriptions + offline queue. Methods event.bind, event.get, event.unbind, event.offline.* (${API_VERSION}). RU/EN: события, подписка, webhook события, офлайн-очередь, отписаться / events, bind, subscription, offline queue, unbind.`,
    ["bind", "unbind", "get", "offline_list", "offline_clear", "offline_execute", "offline_error", "get_supported", "get_list", "events_list"],
    {
      event: { type: "string", description: "Event name, e.g. onCrmLeadAdd" },
      handler: { type: "string", description: "Handler URL" },
      authType: { type: "string", description: "Auth type" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      bind: { restMethod: "event.bind", httpVerb: "POST", rawBody: true },
      unbind: { restMethod: "event.unbind", httpVerb: "POST", rawBody: true },
      get: { restMethod: "event.get", httpVerb: "GET" },
      offline_list: { restMethod: "event.offline.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      offline_clear: { restMethod: "event.offline.clear", httpVerb: "POST", pathParams: ["start"] },
      offline_execute: { restMethod: "event.offline.execute", httpVerb: "POST" },
      offline_error: { restMethod: "event.offline.error", httpVerb: "POST", rawBody: true },
      get_supported: { restMethod: "event.supported.list", httpVerb: "GET" },
      get_list: { restMethod: "event.get", httpVerb: "GET" },
      events_list: { restMethod: "events", httpVerb: "GET" },
    },
    client,
    {
      bind: "Subscribe a handler to an event", unbind: "Unsubscribe (destructive)", get: "List active subscriptions",
      offline_list: "List offline event queue", offline_clear: "Clear offline event queue (destructive)",
      offline_execute: "Execute offline event queue", offline_error: "Register an offline event processing error",
      get_supported: "List supported event names", get_list: "List subscriptions", events_list: "List all available event names",
    },
  );
}