import type { Bitrix24ApiClient } from "../../api-client.js";
import type { ToolDefinition } from "../../types.js";
import { createActionTool } from "../framework.js";
import { P } from "../params.js";
import { API_VERSION } from "../../constants.js";

export function createMailTool(client: Bitrix24ApiClient): ToolDefinition {
  return createActionTool(
    "bx24_mail",
    `Bitrix24 mail: mailboxes, messages, send, reply, forward, filters, recipient. Methods mail.mailbox.*, mail.message.*, mail.recipient.*, mailservice.* (${API_VERSION}). RU/EN: почта, письмо, отправить письмо, ящик, фильтр / mail, email, send email, mailbox, filter.`,
    ["mailbox_list", "mailbox_get", "mailbox_add", "mailbox_delete", "message_list", "message_get", "message_send", "message_delete", "message_reply", "message_forward", "recipient_list", "mailservice_list", "filter_add", "filter_delete", "filter_list", "message_mark"],
    {
      id: P.id, mailboxId: { type: "string", description: "Mailbox ID" },
      messageId: { type: "string", description: "Message ID" },
      fields: { type: "object", description: "Message fields: MAILBOX_ID, TO, SUBJECT, BODY, FROM" },
      filterFields: { type: "object", description: "Filter fields: NAME, MAILBOX_ID, ACTION" },
      filter: P.filter, select: P.select, order: P.order, start: P.start,
    },
    {
      mailbox_list: { restMethod: "mail.mailbox.list", httpVerb: "GET", isList: true },
      mailbox_get: { restMethod: "mail.mailbox.get", httpVerb: "GET", pathParams: ["mailboxId"] },
      mailbox_add: { restMethod: "mail.mailbox.create", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      mailbox_delete: { restMethod: "mail.mailbox.delete", httpVerb: "POST", pathParams: ["mailboxId"] },
      message_list: { restMethod: "mail.message.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      message_get: { restMethod: "mail.message.get", httpVerb: "GET", pathParams: ["messageId"] },
      message_send: { restMethod: "mail.message.send", httpVerb: "POST", bodyParam: "fields", bodyWrapper: "fields" },
      message_delete: { restMethod: "mail.message.delete", httpVerb: "POST", pathParams: ["messageId"] },
      message_reply: { restMethod: "mail.message.reply", httpVerb: "POST", pathParams: ["messageId"], bodyParam: "fields", bodyWrapper: "fields" },
      message_forward: { restMethod: "mail.message.forward", httpVerb: "POST", pathParams: ["messageId"], bodyParam: "fields", bodyWrapper: "fields" },
      recipient_list: { restMethod: "mail.recipient.list", httpVerb: "GET", isList: true, queryParams: ["filter", "select", "order", "start"] },
      mailservice_list: { restMethod: "mailservice.list", httpVerb: "GET", isList: true },
      filter_add: { restMethod: "mail.filter.add", httpVerb: "POST", bodyParam: "filterFields", bodyWrapper: "fields" },
      filter_delete: { restMethod: "mail.filter.delete", httpVerb: "POST", pathParams: ["id"] },
      filter_list: { restMethod: "mail.filter.list", httpVerb: "GET", isList: true },
      message_mark: { restMethod: "mail.message.mark", httpVerb: "POST", pathParams: ["messageId"] },
    },
    client,
    {
      mailbox_list: "List mailboxes", mailbox_get: "Get a mailbox", mailbox_add: "Add a mailbox", mailbox_delete: "Delete a mailbox (destructive)",
      message_list: "List messages", message_get: "Get a message", message_send: "Send an email (TO, SUBJECT, BODY)",
      message_delete: "Delete a message (destructive)", message_reply: "Reply to a message", message_forward: "Forward a message",
      recipient_list: "List recipients", mailservice_list: "List mail services",
      filter_add: "Add a mail filter", filter_delete: "Delete a mail filter (destructive)", filter_list: "List mail filters",
      message_mark: "Mark a message (seen/flagged)",
    },
  );
}