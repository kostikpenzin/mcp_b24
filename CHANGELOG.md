# Changelog

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