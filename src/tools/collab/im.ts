import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createImTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_im",
    `Bitrix24 messenger: messages, notifications, user info, search, counters, recent. Methods im.message.*, im.notify.*, im.user.*, im.search.*, im.counters.*, im.recent.* (${API_VERSION}). RU/EN: сообщение, написать, уведомление, поиск сообщений, счётчики, недавние / message, notify, search messages, counters, recent.`,
    ["message_add", "message_update", "message_delete", "message_get", "dialog_get", "dialog_messages_list", "notify_personal_add", "notify_system_add", "notify_delete", "user_get", "user_list", "search_message", "search_user", "counters_get", "recent_list", "recent_pinned", "recent_unpin", "recent_hide", "dialog_read", "dialog_unread", "dialog_typing", "dialog_mark", "bot_list", "dialog_users"],
    {
      DIALOG_ID: { type: "string", description: "Dialog ID: chatNNN or numeric user ID" },
      MESSAGE_ID: { type: "string", description: "Message ID" },
      MESSAGE: { type: "string", description: "Message text" },
      SYSTEM: { type: "boolean", description: "Send as system message" },
      TO: { type: "string", description: "Recipient user ID (notify)" },
      ID: { type: "string", description: "Entity ID" },
      USER_ID: { type: "string", description: "User ID" },
      IDS: { type: "array", items: { type: "string" }, description: "Array of user IDs" },
      LIMIT: { type: "integer", minimum: 1, description: "Page size" },
      LAST_ID: { type: "string", description: "Last message ID for pagination" },
      SEARCH: { type: "string", description: "Search string" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      message_add: { restMethod: "im.message.add", httpVerb: "POST", rawBody: true },
      message_update: { restMethod: "im.message.update", httpVerb: "POST", rawBody: true },
      message_delete: { restMethod: "im.message.delete", httpVerb: "POST", pathParams: ["MESSAGE_ID"] },
      message_get: { restMethod: "im.message.get", httpVerb: "GET", pathParams: ["MESSAGE_ID"] },
      dialog_get: { restMethod: "im.dialog.get", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      dialog_messages_list: { restMethod: "im.dialog.messages.list", httpVerb: "GET", queryParams: ["DIALOG_ID", "LIMIT", "LAST_ID"] },
      dialog_read: { restMethod: "im.dialog.read", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      dialog_unread: { restMethod: "im.dialog.unread", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      dialog_typing: { restMethod: "im.dialog.typing.status", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      dialog_mark: { restMethod: "im.message.attention", httpVerb: "POST", pathParams: ["DIALOG_ID", "MESSAGE_ID"] },
      dialog_users: { restMethod: "im.dialog.users.list", httpVerb: "GET", pathParams: ["DIALOG_ID"] },
      notify_personal_add: { restMethod: "im.notify.add", httpVerb: "POST", rawBody: true },
      notify_system_add: { restMethod: "im.notify.system.add", httpVerb: "POST", rawBody: true },
      notify_delete: { restMethod: "im.notify.delete", httpVerb: "POST", pathParams: ["ID"] },
      user_get: { restMethod: "im.user.get", httpVerb: "GET", pathParams: ["ID"] },
      user_list: { restMethod: "im.user.list", httpVerb: "GET", queryParams: ["IDS", "LAST_ID", "LIMIT"] },
      search_message: { restMethod: "im.search.message.list", httpVerb: "GET", queryParams: ["SEARCH", "LIMIT"] },
      search_user: { restMethod: "im.search.user.list", httpVerb: "GET", queryParams: ["SEARCH", "LIMIT"] },
      counters_get: { restMethod: "im.counters.get", httpVerb: "GET" },
      recent_list: { restMethod: "im.recent.list", httpVerb: "GET", queryParams: ["LIMIT", "LAST_ID"] },
      recent_pinned: { restMethod: "im.recent.pin", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      recent_unpin: { restMethod: "im.recent.unpin", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      recent_hide: { restMethod: "im.recent.hide", httpVerb: "POST", pathParams: ["DIALOG_ID"] },
      bot_list: { restMethod: "imbot.bot.list", httpVerb: "GET" },
    },
    client,
    {
      message_add: "Send a message (DIALOG_ID, MESSAGE)", message_update: "Update a message (MESSAGE_ID, MESSAGE)",
      message_delete: "Delete a message (destructive)", message_get: "Get a message by ID",
      dialog_get: "Get dialog info", dialog_messages_list: "List dialog message history",
      dialog_read: "Mark dialog read", dialog_unread: "Mark dialog unread",
      dialog_typing: "Send typing status", dialog_mark: "Mark a message for attention",
      dialog_users: "List dialog users",
      notify_personal_add: "Send a personal notification (TO, MESSAGE)", notify_system_add: "Send a system notification",
      notify_delete: "Delete a notification (destructive)",
      user_get: "Get IM user info", user_list: "List IM users by IDs",
      search_message: "Search messages", search_user: "Search users in IM",
      counters_get: "Get chat/message counters", recent_list: "List recent dialogs",
      recent_pinned: "Pin a recent dialog", recent_unpin: "Unpin a recent dialog", recent_hide: "Hide a recent dialog",
      bot_list: "List available bots",
    },
  );
}