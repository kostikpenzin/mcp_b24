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

## 28 everyday cases (plain language)

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
17. **"Make a quote for deal #456 and attach the PDF"** → `bx24_crm_quotes action=add` → `bx24_crm_documents action=document_add` (template → document).
18. **"Generate the contract from template #3 for company #88"** → `bx24_crm_documents action=document_add` (templateId, entityId, entityType).
19. **"Add currency EUR, rate 100, and set it as base"** → `bx24_crm_currency action=add` → `base_set`.
20. **"Show all webform submissions this week"** → `bx24_crm_webform action=result_list` (filter by date).
21. **"Which source brought the lead? show UTM"** → `bx24_crm_tracking action=trace_list` (filter by ENTITY_ID).
22. **"Conduct the warehouse receipt document, +50 chairs"** → `bx24_crm_products action=document_add` → `document_conduct` (with confirmation).
23. **"Set up a recurring deal template — monthly renewal"** → `bx24_crm_deals action=recurring_add` (dealId + schedule).
24. **"Open a support line and answer the waiting dialog"** → `bx24_openlines action=config_list` → `operator_answer`.
25. **"Register a chat bot 'Helpdesk' that answers /faq"** → `bx24_bots action=bot_register` → `command_register`.
26. **"Add a todo 'Send invoice' to deal #456"** → `bx24_crm_activities action=todo_add` (OWNER_ID, OWNER_TYPE_ID=2).
27. **"Turn the email into a task for Anna"** → `bx24_mail action=message_createtask` (messageId).
28. **"Pin task #77 to the 'Urgent' flow and move to the 'In review' stage"** → `bx24_tasks action=addToFlow` → `moveToStage`.

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