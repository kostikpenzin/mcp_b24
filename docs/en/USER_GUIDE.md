# User Guide

**mcp-b24** is an AI assistant for your Bitrix24 portal. Once connected to an AI client (Claude, Cursor, VS Code, Codex CLI), you manage CRM (leads, deals, contacts, companies, quotes, smart processes), tasks, chats, open lines, chat bots, files, calendar, mail, telephony, business processes, document generation, trade catalog and inventory **in plain language**. The server performs real actions on the portal.

Unlike the official Bitrix24 MCP (documentation only), this server **actually executes** requests: creates leads, assigns tasks, sends messages, starts workflows, generates documents.

## What you need to start

1. An administrator sets up auth once (webhook or OAuth) — see [DEVELOPER_GUIDE → Auth](./DEVELOPER_GUIDE.md).
2. You connect the server in your MCP client — see the root [README](../../README.md).
3. Then you just talk to the assistant in plain language.

## 5 rules for talking to the agent

1. **Be specific**: "Create a lead Ivan, phone +7…", not "add someone".
2. **Give IDs when known**: "Update deal #456", "Assign a task to Anna (id 12)".
3. **Confirm deletions**: with protection on, the server asks first — reply "yes / confirm".
4. **Don't know the fields? ask**: "Show lead fields" → the agent calls `action=fields`.
5. **Bulk → batch**: "Create 5 leads at once" → the agent uses `bx24_batch`.

## 16 everyday cases (plain language)

1. **"Show my tasks for today"** → `bx24_tasks action=list` (RESPONSIBLE_ID=current, DEADLINE=today).
2. **"Create a meeting with Petrov tomorrow at 15:00"** → `bx24_calendar action=event_add`.
3. **"Upload the PDF contract to 'Contracts 2026' and drop the link in the 'Partners' chat"** → `bx24_disk action=file_upload` → `file_getExternalLink` → `bx24_im_chat action=sendMessage`.
4. **"Schedule a conference with the sales team at 16:00"** → `bx24_conf action=create` + `bx24_calendar action=event_add`.
5. **"Show leads from today with no responsible"** → `bx24_crm_leads action=list` (DATE_CREATE>=today, ASSIGNED_BY_ID=null).
6. **"Make a report on the 'Sales' funnel"** → `bx24_reports action=deal_pipeline`.
7. **"Invite a new employee Ivanov, IT department"** → `bx24_hr action=invite`.
8. **"Email the client that their order is ready"** → `bx24_mail action=message_send`.
9. **"Create a 'Purchases' smart process"** → `bx24_smart_processes action=type_add` + fields.
10. **"Find duplicate contacts and offer to merge"** → `bx24_crm_duplicates action=findbycomm` → `mergeBatch` (with confirmation).
11. **"Start the approval workflow for deal #456"** → `bx24_workflows action=start`.
12. **"Create a deal from a chat"** → `bx24_im_chat` (history) → `bx24_crm_companies/contacts/deals action=add`.
13. **"Assign a task to the department, deadline Friday"** → `bx24_departments` → `bx24_users` → `bx24_tasks action=add`.
14. **"Add a product 'Chair', price 5000, stock 20"** → `bx24_crm_products action=product_add` + `price_add`.
15. **"Show everyone in the marketing department"** → `bx24_departments` → `bx24_users action=search`.
16. **"Open the working day / close the day with a report"** → `bx24_time action=status_open / status_close`.

## Common issues

- **"Agent doesn't respond / can't find"** — check the webhook scope covers the needed module.
- **"Not enough rights"** — the admin must grant the integration access to CRM/tasks/chat/etc.
- **"Can't find a contact"** — search by phone/email: `bx24_crm_contacts action=list` with a filter.

## Security

- The webhook secret and OAuth tokens **never** appear in the conversation or logs.
- Destructive actions with `BX24_CONFIRM_DESTRUCTIVE=true` require confirmation and are written to `audit.log` (see [AUDIT_LOG](./AUDIT_LOG.md)).
- Actions run as the authorized user; portal permissions are respected.

## Where to turn

For access and permissions — your portal administrator. Audit incidents — your security officer (see [AUDIT_LOG](./AUDIT_LOG.md)).