import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createCalendarTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_calendar",
    `Bitrix24 calendar: events, sections, meeting status, resources, accessibility, settings. Methods calendar.event.*, calendar.section.*, calendar.meeting.*, calendar.resource.*, calendar.accessibility.*, calendar.user.settings.* (${API_VERSION}). RU/EN: событие, встреча, календарь, создай событие, ближайшие, доступность / event, calendar, create event, nearest, availability.`,
    ["event_add", "event_get", "event_getbyid", "event_list", "event_update", "event_delete", "event_get_nearest", "section_list", "section_add", "section_update", "section_delete", "meeting_status_get", "meeting_status_set", "resource_list", "resource_add", "resource_update", "resource_delete", "resource_booking_list", "accessibility_get", "settings_get", "settings_set"],
    {
      id: P.id,
      type: { type: "string", enum: ["user", "calendar"], description: "Calendar type: user (personal) or calendar (shared)" },
      ownerId: { type: "string", description: "Calendar/owner ID" },
      from: { type: "string", description: "Range start (ISO date)" },
      to: { type: "string", description: "Range end (ISO date)" },
      limit: { type: "integer", minimum: 1, description: "Max events" },
      daysCount: { type: "integer", minimum: 1, description: "Days ahead for get_nearest" },
      fields: { type: "object", description: "Event fields: NAME, DT_FROM, DT_TO, DESCRIPTION, SECTION_ID, ATTENDEES, REMIND, COLOR" },
      sectionFields: { type: "object", description: "Section fields: NAME, COLOR, TYPE" },
      resourceFields: { type: "object", description: "Resource fields: NAME, CAL_TYPE" },
      status: { type: "string", description: "Meeting status (Y/N/Q)" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      event_add: { restMethod: "calendar.event.add", httpVerb: "POST", pathParams: ["type", "ownerId"], bodyParam: "fields", bodyWrapper: "fields" },
      event_get: { restMethod: "calendar.event.get", httpVerb: "POST", pathParams: ["id", "type", "ownerId"] },
      event_getbyid: { restMethod: "calendar.event.getbyid", httpVerb: "GET", pathParams: ["id"] },
      event_list: { restMethod: "calendar.event.list", httpVerb: "POST", isList: true, pathParams: ["type", "ownerId"], queryParams: ["from", "to", "limit"] },
      event_update: { restMethod: "calendar.event.update", httpVerb: "POST", pathParams: ["id", "type", "ownerId"], bodyParam: "fields", bodyWrapper: "fields" },
      event_delete: { restMethod: "calendar.event.delete", httpVerb: "POST", pathParams: ["id", "type", "ownerId"] },
      event_get_nearest: { restMethod: "calendar.event.get.nearest", httpVerb: "POST", pathParams: ["type", "ownerId"], queryParams: ["limit", "daysCount"] },
      section_list: { restMethod: "calendar.section.list", httpVerb: "GET", queryParams: ["type"] },
      section_add: { restMethod: "calendar.section.add", httpVerb: "POST", bodyParam: "sectionFields", bodyWrapper: "fields" },
      section_update: { restMethod: "calendar.section.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "sectionFields", bodyWrapper: "fields" },
      section_delete: { restMethod: "calendar.section.delete", httpVerb: "POST", pathParams: ["id"] },
      meeting_status_get: { restMethod: "calendar.meeting.status.get", httpVerb: "GET", pathParams: ["id"] },
      meeting_status_set: { restMethod: "calendar.meeting.status.set", httpVerb: "POST", pathParams: ["id"], bodyParam: "status", bodyWrapper: "status" },
      resource_list: { restMethod: "calendar.resource.list", httpVerb: "GET" },
      resource_add: { restMethod: "calendar.resource.add", httpVerb: "POST", bodyParam: "resourceFields", bodyWrapper: "fields" },
      resource_update: { restMethod: "calendar.resource.update", httpVerb: "POST", pathParams: ["id"], bodyParam: "resourceFields", bodyWrapper: "fields" },
      resource_delete: { restMethod: "calendar.resource.delete", httpVerb: "POST", pathParams: ["id"] },
      resource_booking_list: { restMethod: "calendar.resource.booking.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      accessibility_get: { restMethod: "calendar.accessibility.get", httpVerb: "GET", queryParams: ["from", "to"] },
      settings_get: { restMethod: "calendar.user.settings.get", httpVerb: "GET" },
      settings_set: { restMethod: "calendar.user.settings.set", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
    },
    client,
    {
      event_add: "Create an event (NAME, DT_FROM, DT_TO)", event_get: "Get an event by ID (with calendar context)",
      event_getbyid: "Get an event by ID only", event_list: "List events in a date range", event_update: "Update event fields",
      event_delete: "Delete an event (destructive)", event_get_nearest: "Get nearest upcoming events",
      section_list: "List calendar sections", section_add: "Create a section",
      section_update: "Update a section", section_delete: "Delete a section (destructive)",
      meeting_status_get: "Get meeting attendance status", meeting_status_set: "Set meeting attendance status (Y/N/Q)",
      resource_list: "List bookable resources", resource_add: "Create a bookable resource",
      resource_update: "Update a resource", resource_delete: "Delete a resource (destructive)",
      resource_booking_list: "List resource bookings",
      accessibility_get: "Get user availability for a date range",
      settings_get: "Get current user calendar settings", settings_set: "Set current user calendar settings",
    },
  );
}