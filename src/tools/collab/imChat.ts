import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { API_VERSION } from "../../constants.js";

export function createImChatTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_im_chat",
    `Bitrix24 chats: create, members, owner, title/color/avatar, mute, messages, counters. Methods im.chat.*, im.dialog.* (${API_VERSION}). RU/EN: чат, создать чат, участники, переименовать, замуть / chat, create chat, members, rename, mute.`,
    ["add", "get", "updateTitle", "updateColor", "updateAvatar", "setOwner", "user_add", "user_list", "user_delete", "leave", "mute", "sendMessage", "editMessage", "deleteMessage", "searchMessages", "readAll", "uploadFile", "getCounters"],
    {
      CHAT_ID: { type: "string", description: "Chat ID" },
      fields: { type: "object", description: "Chat fields: TYPE:'chat', TITLE, USERS:[...], AVATAR, EXTRANET" },
      TITLE: { type: "string", description: "Chat title" },
      COLOR: { type: "string", description: "Chat color (hex)" },
      AVATAR: { type: "string", description: "Avatar (base64-encoded image)" },
      USER_ID: { type: "string", description: "User ID" },
      USERS: { type: "array", items: { type: "string" }, description: "User IDs" },
      MESSAGE: { type: "string", description: "Message text" },
      MESSAGE_ID: { type: "string", description: "Message ID" },
      MUTE_ACTION: { type: "string", enum: ["mute", "unmute"], description: "Mute action" },
      SEARCH: { type: "string", description: "Search string" },
      file: { type: "object", description: "File to upload: NAME, CONTENT base64" },
    },
    {
      add: { restMethod: "im.chat.add", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      get: { restMethod: "im.chat.get", httpVerb: "POST", pathParams: ["CHAT_ID"] },
      updateTitle: { restMethod: "im.chat.update.title", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "TITLE", bodyWrapper: "title" },
      updateColor: { restMethod: "im.chat.update.color", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "COLOR", bodyWrapper: "color" },
      updateAvatar: { restMethod: "im.chat.update.avatar", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "AVATAR", bodyWrapper: "avatar" },
      setOwner: { restMethod: "im.chat.set.owner", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "USER_ID", bodyWrapper: "userId" },
      user_add: { restMethod: "im.chat.user.add", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "USERS", bodyWrapper: "users" },
      user_list: { restMethod: "im.chat.user.list", httpVerb: "GET", pathParams: ["CHAT_ID"] },
      user_delete: { restMethod: "im.chat.user.delete", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "USERS", bodyWrapper: "users" },
      leave: { restMethod: "im.chat.leave", httpVerb: "POST", pathParams: ["CHAT_ID"] },
      mute: { restMethod: "im.chat.mute", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "MUTE_ACTION", bodyWrapper: "action" },
      sendMessage: { restMethod: "im.message.add", httpVerb: "POST", rawBody: true },
      editMessage: { restMethod: "im.message.update", httpVerb: "POST", rawBody: true },
      deleteMessage: { restMethod: "im.message.delete", httpVerb: "POST", pathParams: ["MESSAGE_ID"] },
      searchMessages: { restMethod: "im.search.message.list", httpVerb: "GET", queryParams: ["CHAT_ID", "SEARCH"] },
      readAll: { restMethod: "im.dialog.read", httpVerb: "POST", pathParams: ["CHAT_ID"] },
      uploadFile: { restMethod: "im.disk.file.add", httpVerb: "POST", pathParams: ["CHAT_ID"], bodyParam: "file", bodyWrapper: "file" },
      getCounters: { restMethod: "im.counters.get", httpVerb: "GET" },
    },
    client,
    {
      add: "Create a chat (fields: TYPE, TITLE, USERS)", get: "Get chat info by CHAT_ID",
      updateTitle: "Rename a chat", updateColor: "Change chat color", updateAvatar: "Change chat avatar",
      setOwner: "Set a new chat owner", user_add: "Add users (USERS array)", user_list: "List chat users",
      user_delete: "Remove users (destructive)", leave: "Leave a chat (destructive)",
      mute: "Mute/unmute a chat (MUTE_ACTION)", sendMessage: "Send a message (DIALOG_ID=CHAT_ID, MESSAGE)",
      editMessage: "Edit a message (MESSAGE_ID, MESSAGE)", deleteMessage: "Delete a message (destructive)",
      searchMessages: "Search messages in a chat", readAll: "Mark chat read",
      uploadFile: "Upload a file to a chat", getCounters: "Get chat counters",
    },
  );
}