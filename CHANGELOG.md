# Changelog
## 0.3.0 (2026-08-24)

Major API coverage expansion: **41 tools** (was 30), **~870 actions** (was ~290) wrapping ~780 unique Bitrix24 REST methods.

### New tools (11)

- **CRM (9):** `bx24_crm_quotes` (crm.quote.*), `bx24_crm_documents` (document generator), `bx24_crm_currency` (currencies), `bx24_crm_webform` (webforms + results), `bx24_crm_tracking` (tracking sources/traces/channels), `bx24_crm_automation` (automation triggers), `bx24_crm_calllists` (call lists), `bx24_crm_addresses` (client addresses), `bx24_crm_stagehistory` (stage movement history).
- **collab (2):** `bx24_openlines` (IM open lines), `bx24_bots` (chat bots v2 — registration, chats, messages, reactions, commands, files, events).

### Extended tools (15)

- `bx24_crm_products` — full trade catalog: price types, measures, VAT, ratios, rounding rules, extra charges, inventory documents, product properties/enum/feature/section, variations (offers), SKU heads, services, stock records, catalog metadata, enums.
- `bx24_crm_activities` — todo/configurable/type/badge activities, full timeline (comment/note/logmessage/bindings/pin).
- `bx24_crm_requisites` — bank details, user fields, link register/unregister, preset add/update/delete.
- `bx24_crm_leads`/`deals`/`contacts`/`companies` — contact/company items set/delete, details.configuration.*, deal recurring.*, lead productrows.*.
- `bx24_crm_duplicates` — volatile types, full crm.status.* dictionary CRUD.
- `bx24_tasks` — flows (create/get/update/delete/activate/pin), kanban stages, planner, dependencies, result update/delete, elapsed update/get/list/delete, checklist move/renew, task user fields.
- `bx24_disk` — folder get/shareToUser/markDeleted/restore/fields, storage getChildren/uploadFile/getTypes/getForApp/fields, file restoreFromVersion/fields, attachedObject_get, rights_getTasks.
- `bx24_calendar` — event getbyid, resource add/update/delete/booking_list, meeting_status_get, settings_get/set.
- `bx24_im` — message like/share/command, dialog read_all/messages_search, notify get/read/answer/confirm/history_search, search chat/department/last, department managers/employees/colleagues, user status, v2 files/events.
- `bx24_im_chat` — setManager, dialog messages search.
- `bx24_projects` — user invite/update, subject add/update/delete.
- `bx24_lists` — section add/update/delete, field type get, element get file url, get iblock type id.
- `bx24_mail` — message movetofolder/createtask/createcalendarevent/createchat/createfeedpost/createcrmactivity/removecrmactivity, mailbox senders/fields, message fields, recipient contacts/employees/fields, mailservice CRUD + fields.
- `bx24_telephony` — externalCall show/hide/attachRecord/searchCrmEntities, call attachTranscription, voximplant callbacks/info-calls/TTS/urls/lines/stats/users, SIP update/get/status/connector_status.
- `bx24_workflows` — workflow terminate, task delegate, template add/update/delete, robot/activity add/update/delete/log, event send.
- `bx24_time` — time control (reports/settings), network ranges, schedules, records.
- `bx24_users` — userfield_list.
- `bx24_events` — offline_error, events_list (available event names).

### Infrastructure

- `src/tools/params.ts` — shared param helpers for new entity types (quotes, currency, webform, catalog extended, open lines, bots, calendar resources, etc.).
- Tests: 86 (was 75); routing cases added for all 11 new tools; action↔mapping parity test validates every action resolves.
- Documentation: README, TOOLS_REFERENCE (RU + EN), package.json description updated to 41 tools / ~870 actions.
- Tests: 88 (was 75); added `endpoint-coverage.test.ts` — parses source mappings and instruments fetch to verify every one of the 872 action→REST-method routings; routing cases added for all 11 new tools; action↔mapping parity test validates every action resolves.

## 0.2.3 (2026-08-24)

- Documentation is now bilingual: `docs/en/*` (English, default) + `docs/ru/*` (Russian), with Mermaid diagrams (architecture, data flow, auth, tool groups, destructive-confirm, audit flow).

## 0.2.2 (2026-08-24)

- Removed `docs/superpowers/` (internal design spec) from the repository and published package.


## 0.2.1 (2026-08-24)

- README rewritten in the reference `mcp-iva-mcu` style: centered header, npm/license/tests/Node/MCP/platform/dependencies/secrets/malware badges, English-first, nav links, author signature.
- Russian README moved to `i18n/README.ru.md`; `i18n/README.en.md` removed (root README is now English).
- `package.json`: description + keywords aligned to reference tone; author Penzin Konstantin.
- Published to npm as `mcp-b24@0.2.1`.

## 0.2.0 (2026-08-24)

Full Bitrix24 MCP server per technical specification (`mcp-b24`).

- **30 tools** (28 domain + `bx24_batch` + `bx24_call`), ~290 actions across:
  - CRM: leads, deals, contacts, companies, invoices (SMART_INVOICE entityTypeId=31), products (catalog.*), activities (+timeline), requisites, duplicates (merge), smart processes (crm.type.*/crm.item.*).
  - collab: tasks (+checklists, comments, elapsed, flows, stages), projects (sonet_group), disk (storage/folder/file/versions/links), im (messages/notify/search/counters/recent), im_chat, conferences, calendar (+sections/meeting/resource/accessibility).
  - org: users (+userfield/CRUD), departments, timeman, HR (humanresources/invite/dismiss).
  - biz: lists, mail, reports, marketing, workflows (bizproc), telephony (externalLine/externalCall/sip/voximplant), events (bind/offline).
  - generic: `bx24_batch` (≤50 calls, `$result[]` refs), `bx24_call` (any REST method).
- **Auth:** webhook + OAuth 2.0 with automatic refresh, `client_endpoint` from OAuth response, `oauth.bitrix.info` default.
- **Rate limiting:** token-bucket (`BX24_RATE_LIMIT_RPS`/`BURST`), backoff for 503 `QUERY_LIMIT_EXCEEDED` and 429 `OPERATION_TIME_LIMIT` (`operating_reset_at`).
- **Destructive actions:** two-phase confirmation with structured `requiresConfirmation` preview, JSONL audit log (`BX24_AUDIT_LOG`), secret masking.
- **i18n:** RU/EN typed dictionaries (`BX24_DEFAULT_LANG`).
- **Env:** `BX24_MODE`, `BX24_DOMAIN`, `BX24_*` prefix, `BX24_LOG_LEVEL`, `BX24_AUDIT_LOG`, etc.
- **Transport:** stdio + Streamable HTTP (stateless).
- **Docs:** USER_GUIDE, SELLER_GUIDE, DEVELOPER_GUIDE, TOOLS_REFERENCE, AUDIT_LOG + EN README + `.env.example` + `docker-compose.yml` + `specs/openapi.yaml`.
- 73 tests (config, api-client, framework, validate, tools mappings, MCP protocol).

## 0.1.0 (2026-08-24)

Initial 18-tool core (`mcp-bitrix24`): CRM core + tasks + IM + disk + user + calendar + batch + call.