# Seller / Role Guide

Role-specific scenarios and ready-to-copy recipes. Paste the phrasing into your chat with the AI agent.

## For the CRM manager (sales)

**Lead pipeline**
- "Show new leads from the last week with no touch" → `bx24_crm_leads action=list` (DATE_CREATE>=-7d, no ASSIGNED_BY_ID).
- "Qualify lead #123: move to 'In progress', assign Petrov" → `bx24_crm_leads action=update` (STATUS_ID, ASSIGNED_BY_ID).

**Lost deals & re-engagement**
- "Show deals in 'Negotiation' older than 7 days" → `bx24_crm_deals action=list`.
- "Schedule a call for deal #456 tomorrow at 10:00" → `bx24_crm_activities action=add` (OWNER_ID=456, OWNER_TYPE_ID=2, TYPE_ID=3, START_TIME).

**Upsell / cross-sell**
- "Find clients who bought X and offer Y" → `bx24_crm_products` + `bx24_crm_deals action=list` + `bx24_mail action=message_send`.

## For the ROP

- "How many deals did Petrov close this month" → `bx24_crm_deals action=list` + aggregate.
- "Conversion from 'Presentation' to 'Contract'" → `bx24_reports action=deal_conversion`.
- "Show stalled deals (>14 days no movement)" → `bx24_crm_deals action=list`.
- "Notify everyone responsible about stalled deals" → `bx24_im action=notify_personal_add` (or `bx24_batch`).

## For HR

- "Show everyone in the marketing department" → `bx24_departments action=list` → `bx24_users action=listByDepartment`.
- "Invite a new employee Ivanov, frontend, IT department" → `bx24_hr action=invite`.
- "Create a 1:1 meeting with the manager" → `bx24_calendar action=event_add`.
- "Transfer Anna to the sales department" → `bx24_hr action=transfer`.

## For the portal administrator

- "Which events are bound (event.bind)" → `bx24_events action=get`.
- "Unsubscribe from onCrmLeadDelete" → `bx24_events action=unbind` (with confirmation).
- "Audit note on destructive actions" → `audit.log` (see [AUDIT_LOG](./AUDIT_LOG.md)).
- "Generate a weekly activity report" → `bx24_reports action=user_activity`.

## For the marketer

- "Find all VK leads" → `bx24_crm_leads action=list` (SOURCE_ID=VK).
- "Build a segment of leads with overdue payments" → `bx24_marketing action=segment_create`.
- "Email clients with overdue payments" → `bx24_mail action=message_send` (or `bx24_marketing action=broadcast_send`).

## For the project manager

- "Assign a task to the department, deadline Friday" → `bx24_departments` + `bx24_users` + `bx24_tasks action=add` (AUDITORS=department).
- "How many tasks are in progress for Anna" → `bx24_tasks action=list` + `action=count`.
- "Create the 'Alpha' project with members" → `bx24_projects action=create` + `user_add`.

## Ready-to-paste snippets

```
Create a lead: {{name}}, phone {{phone}}, email {{email}}, source {{source}}.
Show deals in the "{{funnel}}" funnel older than {{N}} days and send the list to the responsibles.
Assign the task "{{title}}" to {{name}}, deadline {{date}}, watchers — the {{department}} department.
Send to the "{{chat}}" chat: {{text}} and attach the file {{file}}.
Start the "{{workflow}}" workflow for deal #{{id}}.
```

## Rollout checklist

1. A webhook or OAuth app exists on the portal with the needed scopes (crm, tasks, im, imopenlines, imbot, disk, calendar, user, catalog, lists, mail, telephony, bizproc, humanresources, timeman, event).
2. `BX24_CONFIRM_DESTRUCTIVE=true` on production portals.
3. `BX24_AUDIT_LOG` points to a location only admins can read.
4. MCP-client configs handed to users (see README).
5. Run the demo scenarios from [USER_GUIDE](./USER_GUIDE.md).