<div align="center">

# MCP Server for Bitrix24

[![npm version](https://img.shields.io/npm/v/mcp-b24.svg)](https://www.npmjs.com/package/mcp-b24)
[![npm downloads](https://img.shields.io/npm/dm/mcp-b24.svg)](https://www.npmjs.com/package/mcp-b24)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-88-brightgreen.svg)](./CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-green.svg)](https://nodejs.org/)
[![MCP protocol](https://img.shields.io/badge/protocol-MCP-purple.svg)](https://modelcontextprotocol.io)
[![platform](https://img.shields.io/badge/platform-Bitrix24-blue.svg)](https://www.bitrix24.com)

[![dependencies](https://img.shields.io/badge/dependencies-0%20vulnerabilities-brightgreen.svg)](#security)
[![secrets](https://img.shields.io/badge/secrets-none%20hardcoded-brightgreen.svg)](#security)
[![malware](https://img.shields.io/badge/malware-none%20detected-brightgreen.svg)](#security)

**41 tools** · **~870 actions** · **Bitrix24 REST 1.0 + 3.0** · **88 tests**

MCP server for the **Bitrix24** platform.
Wraps the Bitrix24 REST API (CRM, tasks, chats, files, calendar, HR, smart
processes, mail, telephony, workflows, events, open lines, chat bots, document
generator, quotes, currency, webforms, tracking, inventory) into 41 tools your
AI agent can call directly — and **executes real calls** on the portal (unlike
the official Bitrix24 MCP, which only serves documentation).

[Installation](#installation) ·
[Configuration](#mcp-client-configuration) ·
[Capabilities](#capabilities) ·
[Tools](#tools-overview) ·
[Scenarios](#usage-scenarios) ·
[Development](#development) ·
[npm package](https://www.npmjs.com/package/mcp-b24)

**Languages:** English · [Русский](./i18n/README.ru.md)

</div>

---

## Portal & Subscription

This MCP server wraps the [**Bitrix24**](https://www.bitrix24.com) REST API.
**Bitrix24** is an all-in-one workspace: CRM, tasks, projects, chats, video
calls, documents, mail, calendar, HR, business processes, telephony, and more.
It is available as cloud (`*.bitrix24.ru` / `*.bitrix24.com`) and on-premise.

> ⚠️ **A Bitrix24 portal is required** to use this server. You need either an
> **incoming webhook** (`BX24_WEBHOOK_URL`) or an **OAuth application**
> (`BX24_DOMAIN` + `BX24_CLIENT_ID` + `BX24_CLIENT_SECRET` +
> `BX24_REFRESH_TOKEN`). Create a webhook under *Developer resources → Incoming
> webhook* on your portal, or register an OAuth app at `oauth.bitrix24.ru`.

➡️ More details: [bitrix24.com](https://www.bitrix24.com) · REST docs:
[apidocs.bitrix24.ru](https://apidocs.bitrix24.ru)

---

## Compatible API Versions

| API | Version | Base Path | Auth | Modules |
|-----|---------|-----------|------|---------|
| Bitrix24 REST | **1.0 + 3.0** | `/rest/<method>.json` | incoming webhook or OAuth 2.0 | CRM, tasks, IM, disk, calendar, user, catalog, lists, mail, telephony, bizproc, HR, timeman, events, open lines, chat bots, document generator, quotes, currency, webforms, tracking, inventory |

## Installation

### Prerequisites

- Node.js 18+
- An active [Bitrix24](https://www.bitrix24.com) portal (cloud or on-premise)
- An auth credential: incoming webhook **or** OAuth app (see below)

### Install from npm

```bash
npm install -g mcp-b24
# or run without installing
npx -y mcp-b24
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BX24_MODE` | Optional | `webhook` or `oauth` (auto-detected if omitted) |
| `BX24_WEBHOOK_URL` | webhook | Incoming webhook URL: `https://portal.bitrix24.ru/rest/<user_id>/<secret>/` |
| `BX24_DOMAIN` | oauth | Portal domain, e.g. `portal.bitrix24.ru` |
| `BX24_CLIENT_ID` | oauth | OAuth client id |
| `BX24_CLIENT_SECRET` | oauth | OAuth client secret |
| `BX24_REFRESH_TOKEN` | oauth | Refresh token for auto-refresh |
| `BX24_ACCESS_TOKEN` | Optional | Ready access token (otherwise obtained from refresh) |
| `BX24_OAUTH_SERVER` | Optional | `https://oauth.bitrix.info` (default) |
| `BX24_CONFIRM_DESTRUCTIVE` | Optional | Set `true` to require `confirm: true` before destructive actions |
| `BX24_AUTO_PAGINATE` | Optional | Set `true` to auto-collect list pages up to `BX24_MAX_ROWS` |
| `BX24_MAX_ROWS` | Optional | Row cap for auto-pagination (default 5000) |
| `BX24_RATE_LIMIT_RPS` | Optional | Requests/sec (≤2 non-Enterprise, ≤5 Enterprise; default 2) |
| `BX24_RATE_LIMIT_BURST` | Optional | Token-bucket burst (default 50) |
| `BX24_DEFAULT_LANG` | Optional | `ru` or `en` (default `ru`) |
| `BX24_LOG_LEVEL` | Optional | `silent` `error` `warn` `info` `debug` (default `info`) |
| `BX24_AUDIT_LOG` | Optional | JSONL audit path for destructive + auth events (omit to disable) |
| `BX24_TRANSPORT` | Optional | `stdio` or `http` (default `stdio`) |
| `BX24_HTTP_HOST/PORT/PATH` | Optional | HTTP transport endpoint (default `127.0.0.1:3000/mcp`) |

You can either:
- Set `BX24_WEBHOOK_URL` — simplest, acts on behalf of the webhook creator; no refresh needed, or
- Set `BX24_DOMAIN` + OAuth credentials — the server will auto-refresh access tokens (≈1 h lifetime) and follow `client_endpoint` from the OAuth response.

### Destructive Action Confirmation

When `BX24_CONFIRM_DESTRUCTIVE=true` is set, the server requires an explicit `confirm: true` parameter before executing destructive actions (delete, remove, complete, leave, kick, cancel, stop, close, mute, unbind, clear, markDeleted, kill, …). Without it, the tool returns a structured `requiresConfirmation` preview and does **not** execute, protecting against accidental data loss with AI agents. Every destructive operation that runs is written to the JSONL audit log (`BX24_AUDIT_LOG`). When unset or `false`, destructive actions execute without confirmation (default).

## MCP Client Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

**npx (recommended):**

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": {
        "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/",
        "BX24_CONFIRM_DESTRUCTIVE": "true"
      }
    }
  }
}
```

**OAuth:**

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": {
        "BX24_MODE": "oauth",
        "BX24_DOMAIN": "portal.bitrix24.ru",
        "BX24_CLIENT_ID": "app.abc123",
        "BX24_CLIENT_SECRET": "******",
        "BX24_REFRESH_TOKEN": "******"
      }
    }
  }
}
```

**Windows** — use `cmd /c`:

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "mcp-b24"],
      "env": { "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/" }
    }
  }
}
```

**Docker:**

```bash
docker build -t mcp/bitrix24 .
```

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "BX24_WEBHOOK_URL", "mcp/bitrix24"],
      "env": { "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/" }
    }
  }
}
```

**Streamable HTTP:**

```bash
BX24_TRANSPORT=http BX24_HTTP_PORT=3000 BX24_WEBHOOK_URL="https://..." npx mcp-b24
# serves http://127.0.0.1:3000/mcp
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": { "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/" }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` (note: top-level key is `servers`, not `mcpServers`):

```json
{
  "servers": {
    "bitrix24": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": { "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/" }
    }
  }
}
```

### Codex CLI

```bash
codex mcp add bitrix24 --env BX24_WEBHOOK_URL=https://portal.bitrix24.ru/rest/1/abcd1234/ -- npx -y mcp-b24
```

### From source

```bash
git clone https://github.com/kostikpenzin/mcp_b24.git
cd mcp_b24
npm install
npm run build
```

```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "node",
      "args": ["/absolute/path/to/mcp_b24/dist/index.js"],
      "env": { "BX24_WEBHOOK_URL": "https://portal.bitrix24.ru/rest/1/abcd1234/" }
    }
  }
}
```

## Tools Overview

### 41 tools, ~870 actions

| Tool | Description | Group |
|------|-------------|-------|
| `bx24_crm_leads` | Leads: CRUD, contacts, product rows, user fields, convert, card config | CRM |
| `bx24_crm_deals` | Deals + pipelines/categories, product rows, contact bindings, recurring, user fields | CRM |
| `bx24_crm_contacts` | Contacts: CRUD, company bindings, user fields, card config | CRM |
| `bx24_crm_companies` | Companies: CRUD, contact bindings, user fields, card config | CRM |
| `bx24_crm_invoices` | Invoices (SMART_INVOICE, entityTypeId=31) + stages | CRM |
| `bx24_crm_products` | Trade catalog: products, sections, prices, stores, price types, measures, VAT, ratios, inventory documents, properties, offers/SKU/services | CRM |
| `bx24_crm_activities` | Activities (calls/meetings/emails) + todo + configurable + types + badges + full timeline | CRM |
| `bx24_crm_requisites` | Requisites + presets + bank details + links + user fields | CRM |
| `bx24_crm_duplicates` | Duplicate search & merge + status dictionaries + volatile types | CRM |
| `bx24_smart_processes` | Smart processes: types + items (arbitrary entities) | CRM |
| `bx24_crm_quotes` | Quotes: CRUD, product rows, contact bindings, user fields | CRM |
| `bx24_crm_documents` | Document generator: templates, documents, numerators, bindings, providers | CRM |
| `bx24_crm_currency` | Currencies: CRUD, base currency, localizations | CRM |
| `bx24_crm_webform` | Webforms + results + options | CRM |
| `bx24_crm_tracking` | Tracking: traces, sources, channels | CRM |
| `bx24_crm_automation` | CRM automation triggers | CRM |
| `bx24_crm_calllists` | Call lists (cold-call dial lists) | CRM |
| `bx24_crm_addresses` | CRM addresses: CRUD, by client, delete by filter | CRM |
| `bx24_crm_stagehistory` | Stage movement history | CRM |
| `bx24_tasks` | Tasks: lifecycle + checklists + comments + elapsed + flows + stages + planner + dependencies + user fields | collab |
| `bx24_projects` | Groups/projects (social network) + members + subjects | collab |
| `bx24_disk` | Disk: storages, folders, files, versions, sharing, external links, rights | collab |
| `bx24_im` | Messenger: messages, notifications, users, search, counters, recent, departments, events v2, files v2 | collab |
| `bx24_im_chat` | Chats: create, members, owner/manager, title/color/avatar, mute, messages | collab |
| `bx24_conf` | Video conferences | collab |
| `bx24_calendar` | Calendar: events, sections, meetings, resources, availability, settings | collab |
| `bx24_openlines` | IM open lines: configs, sessions, operators, CRM links, network | collab |
| `bx24_bots` | Chat bots v2: registration, chats, messages, reactions, commands, files, events | collab |
| `bx24_users` | Users: current, get, search, user fields (incl. list), CRUD | org |
| `bx24_departments` | Departments / org structure | org |
| `bx24_time` | Working time tracking (timeman) + time control + network ranges + schedules + records | org |
| `bx24_hr` | HR: employees, invite, dismiss, transfer | org |
| `bx24_lists` | Universal lists (infoblocks) + sections + field types | biz |
| `bx24_mail` | Mail: mailboxes, messages, send/reply/forward, filters, services, message→task/calendar/chat/CRM | biz |
| `bx24_reports` | Analytics & reports | biz |
| `bx24_marketing` | Segments, broadcast, lead filters | biz |
| `bx24_workflows` | Business processes & robots: templates, instances, tasks, robot/activity CRUD, events | biz |
| `bx24_telephony` | Telephony: external lines/calls, SIP, voximplant (callbacks, info-calls, TTS, lines, stats) | biz |
| `bx24_events` | Event subscriptions + offline queue + supported events list | biz |
| `bx24_batch` | Combine up to 50 REST calls in one request (`$result[]` refs) | generic |
| `bx24_call` | Invoke any Bitrix24 REST method by name (escape-hatch) | generic |

Each domain tool is **action-based**: the `action` enum selects the operation
(e.g. `action: "add"`, `"list"`, `"update"`, `"delete"`). Full action list:
[`docs/en/TOOLS_REFERENCE.md`](./docs/en/TOOLS_REFERENCE.md) (RU: [`docs/ru/`](./docs/ru/README.md)).

## Capabilities

The MCP server understands **natural language in Russian and English**. You
don't need to know tool names or action enums — describe what you want in plain
language and the AI agent maps it to the right tool and action.

### What you can do

- **CRM** — create/find/update leads, contacts, companies, deals, quotes; move
  deals across pipelines; manage activities (calls/meetings); product rows;
  custom fields; requisites + bank details; find & merge duplicates; smart
  processes; document generation; currencies; webforms; tracking; addresses;
  call lists; automation triggers; stage history
- **Tasks & projects** — create, complete, delegate, defer tasks; checklists;
  comments; elapsed time; flows; kanban stages; planner; dependencies;
  user fields; manage groups/projects + subjects
- **Chats & messenger** — create chats, add/remove members, send/edit/delete
  messages, reactions, search, counters, notifications, recent; open lines
  (configs, sessions, operators); chat bots v2 (registration, commands, files)
- **Files (Disk)** — upload/download/move/copy files, list folders, versions,
  sharing, public links, rights, attached objects
- **Calendar** — events, sections, meetings, resources, availability, settings
- **HR & org** — users, departments, working time + time control + network
  ranges + schedules, invite/dismiss/transfer
- **Business** — universal lists + sections, mail (incl. message→task/event/
  chat/CRM), reports, marketing, workflows + robot/activity CRUD, telephony
  (calls, SIP, voximplant callbacks/info-calls/TTS/lines/stats), events
- **Trade catalog** — products, sections, prices, price types, measures, VAT,
  ratios, rounding rules, extra charges, inventory documents, product
  properties, variations (offers), SKU heads, services, stock records
  (bizproc), telephony, event subscriptions
- **Batch & generic** — combine up to 50 calls; call any REST method by name

### Security

- Credentials (webhook secret, OAuth tokens) are **never** exposed to the AI
  agent or returned in tool results
- Destructive actions can require explicit `confirm: true`
  (`BX24_CONFIRM_DESTRUCTIVE=true`) and are written to the JSONL audit log
- Rate limits are respected via a token-bucket; `QUERY_LIMIT_EXCEEDED` (503) and
  `OPERATION_TIME_LIMIT` (429) are retried with backoff
- Password management and auth/login actions are excluded — auth is handled
  automatically via environment variables

## Usage Scenarios

### 1. Create a lead

> **You say:** "Create a lead Ivan Petrov, phone +79001234567, email ivan@example.ru"

The AI agent will call `bx24_crm_leads` with `action: "add"` and
`fields = { TITLE: "Ivan Petrov", PHONE: [{ VALUE: "+79001234567", VALUE_TYPE: "WORK" }], EMAIL: [...] }`.

### 2. Show my tasks for today

> **You say:** "Покажи мои задачи на сегодня"

The AI agent will call `bx24_tasks` with `action: "list"` filtering by
`RESPONSIBLE_ID = current` and `DEADLINE = today`.

### 3. Move a deal across the pipeline

> **You say:** "Передвинь сделку №456 на стадию «В работе»"

The AI agent will call `bx24_crm_deals` with `action: "update"` setting
`STAGE_ID` (stages can be listed via `action: "category_list"`).

### 4. Send a message to a chat

> **You say:** "Напиши в чат «Проект Альфа»: релиз сегодня в 18:00"

The AI agent will call `bx24_im_chat` with `action: "sendMessage"`
(`DIALOG_ID = chatNNN`, `MESSAGE = "…"`).

### 5. Upload a file and share the link

> **You say:** "Загрузи PDF-договор на Диск в папку «Договоры 2026» и скинь ссылку в чат «Партнёры»"

The AI agent will: `bx24_disk` → `file_upload`, then `file_getExternalLink`,
then `bx24_im_chat` → `sendMessage`.

### 6. Start an approval workflow

> **You say:** "Запусти бизнес-процесс «Согласование с юристами» для сделки #456"

The AI agent will call `bx24_workflows` with `action: "start"`,
`templateId` and `documentId = ["crm", "DEAL", 456]`.

### 7. Analyze the sales funnel

> **You say:** "Сделай отчёт по воронке «Продажи»: сделки по этапам, средний чек"

The AI agent will call `bx24_crm_deals` `action: "list"` (filtered by
`CATEGORY_ID`) and `bx24_reports` `action: "funnel_stages"`, then aggregate.

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript + chmod +x
npm run dev          # Watch mode
npm test             # Run 88 tests (vitest)
npm run test:coverage
npm start            # Run server
docker build -t mcp/bitrix24 .   # Docker image
npm publish          # Publish to npm (auto clean + build + test)
```

## Project Structure

```
mcp_b24/
├── src/
│   ├── index.ts          # MCP server entry point (transport selection)
│   ├── server.ts         # MCP server: register/list/call + instructions
│   ├── config.ts         # Environment configuration (BX24_*)
│   ├── api-client.ts     # HTTP client: webhook/OAuth, refresh, backoff, token-bucket
│   ├── error.ts          # Error handling
│   ├── types.ts          # Shared types
│   ├── i18n/             # ru.ts, en.ts, index.ts
│   ├── audit/log.ts      # JSONL audit of destructive + auth events
│   ├── utils/            # logger, tokenBucket
│   ├── transport.ts      # stdio + Streamable HTTP
│   └── tools/
│       ├── framework.ts  # Data-driven action-tool framework
│       ├── params.ts     # Reusable param schemas
│       ├── index.ts      # Tool registration (41 tools)
│       ├── batch.ts      # bx24_batch
│       ├── call.ts       # bx24_call (escape-hatch)
│       ├── crm/          # 10 CRM tools
│       ├── collab/       # 7 collab tools
│       ├── org/         # 4 org tools
│       └── biz/          # 7 biz tools
├── docs/                 # en/ + ru/ (USER_GUIDE, SELLER_GUIDE, DEVELOPER_GUIDE, TOOLS_REFERENCE, AUDIT_LOG)
├── i18n/README.ru.md     # Russian README
├── specs/openapi.yaml    # OpenAPI overview
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml
├── .env.example
├── LICENSE
├── CHANGELOG.md
├── package.json
└── tsconfig.json
```

## License

[MIT](./LICENSE)

## Author

**Penzin Konstantin** — [GitHub](https://github.com/kostikpenzin) · [penzin85@gmail.com](mailto:penzin85@gmail.com)