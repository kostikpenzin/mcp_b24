# mcp-b24 (English)

A full **MCP server** over the Bitrix24 REST API: CRM, tasks, chats, files, calendar, HR, smart processes, mail, telephony, workflows, events. Unlike the official Bitrix24 MCP (documentation only), this server **executes real calls** on your portal.

- **30 tools** (28 domain + `bx24_batch` + `bx24_call`), ~290 actions.
- **Auth:** incoming webhook **or** OAuth 2.0 with automatic token refresh (`client_endpoint` aware).
- **Transport:** stdio (Claude Desktop, Cursor, Codex) and Streamable HTTP.
- **Safety:** two-phase destructive-action confirmation, JSONL audit log, token-bucket rate limiting, backoff for `QUERY_LIMIT_EXCEEDED`/`OPERATION_TIME_LIMIT`.
- **i18n:** RU/EN (`BX24_DEFAULT_LANG`). 73 tests, TypeScript ESM, MIT.

## Quick start

```bash
npm install -g mcp-b24
export BX24_WEBHOOK_URL="https://YOUR_PORTAL.bitrix24.ru/rest/1/SECRET/"
npx -y mcp-b24
```

OAuth alternative:
```bash
export BX24_MODE=oauth
export BX24_DOMAIN=YOUR_PORTAL.bitrix24.ru
export BX24_CLIENT_ID=...
export BX24_CLIENT_SECRET=...
export BX24_REFRESH_TOKEN=...
```

## Client configs

Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": { "BX24_WEBHOOK_URL": "https://YOUR_PORTAL.bitrix24.ru/rest/1/SECRET/" }
    }
  }
}
```

Windows (cmd): `"command": "cmd", "args": ["/c", "npx", "-y", "mcp-b24"]`.

Cursor (`.cursor/mcp.json`), VS Code (`.vscode/mcp.json`, key `servers`), Codex CLI (`codex mcp add bitrix24 --env BX24_WEBHOOK_URL=... -- npx -y mcp-b24`), Cline/Roo: same `mcpServers` block.

Streamable HTTP:
```bash
BX24_TRANSPORT=http BX24_HTTP_PORT=3000 BX24_WEBHOOK_URL="..." npx mcp-b24
# http://127.0.0.1:3000/mcp
```

## Tools (28 domain + 2 generic)

CRM (leads, deals, contacts, companies, invoices, products, activities, requisites, duplicates, smart processes) · collab (tasks, projects, disk, im, im_chat, conf, calendar) · org (users, departments, time, hr) · biz (lists, mail, reports, marketing, workflows, telephony, events) · generic (`bx24_batch`, `bx24_call`).

Each domain tool is **action-based**: the `action` enum selects the REST operation. Full reference: [docs/TOOLS_REFERENCE.md](../docs/TOOLS_REFERENCE.md).

## Documentation

- [User guide](../docs/USER_GUIDE.md) — everyday scenarios.
- [Seller/role guide](../docs/SELLER_GUIDE.md) — CRM/ROP/HR/admin recipes.
- [Developer guide](../docs/DEVELOPER_GUIDE.md) — architecture, adding tools, tests, publish.
- [Tools reference](../docs/TOOLS_REFERENCE.md) — all 30 tools/actions.
- [Audit log](../docs/AUDIT_LOG.md) — JSONL format & policy.
- [`.env.example`](../.env.example) — all environment variables.

## Examples (natural language)

- "Create a lead Ivan, phone +7..." → `bx24_crm_leads action=add`
- "Show my tasks for today" → `bx24_tasks action=list`
- "Upload the PDF to 'Contracts 2026' and drop the link in 'Partners' chat" → `bx24_disk` + `bx24_im_chat`
- "Start the approval workflow for deal #456" → `bx24_workflows action=start`
- "Delete company 'Old Co'" → `bx24_crm_companies action=delete` (asks confirmation)

## Development

```bash
npm install && npm run build && npm test   # 73 tests
```

License: MIT © Penzin Konstantin. Russian README: [../README.md](../README.md).