# mcp-b24

> 🇷🇺 Русский · 🇬🇧 [English](i18n/README.en.md)

**Полный MCP-сервер над REST API Битрикс24** — превосходит узкий `mcp-bitrix24` (только Tasks) и официальный MCP Битрикс24 (только справочник документации). Реально **выполняет REST-вызовы** к порталу: CRM, задачи, чаты, файлы, календарь, HR, умные процессы, почта, телефония, бизнес-процессы, события.

- **30 инструментов** (28 доменных + `bx24_batch` + `bx24_call`), **~290 действий**.
- **Авторизация:** входящий вебхук **или** OAuth 2.0 с автообновлением токена (`client_endpoint`).
- **Транспорт:** stdio (Claude Desktop, Cursor, Codex) **и** Streamable HTTP.
- **Безопасность:** двухфазное подтверждение деструктивных действий, JSONL-аудит, token-bucket rate-limit, backoff для `QUERY_LIMIT_EXCEEDED`/`OPERATION_TIME_LIMIT`.
- **Локализация RU/EN** (`BX24_DEFAULT_LANG`). 73 теста, TypeScript ESM, MIT.

**Бейджи:** `npm v0.2.0` · `MIT` · `Node.js ≥ 18` · `MCP 1.x` · `Bitrix24 REST 1.0 + 3.0`.

## Документация

| Аудитория | Файл |
|---|---|
| Обычные сотрудники | [docs/USER_GUIDE.md](docs/USER_GUIDE.md) |
| Менеджеры / РОП / HR / админы | [docs/SELLER_GUIDE.md](docs/SELLER_GUIDE.md) |
| Разработчики | [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) |
| Справочник инструментов | [docs/TOOLS_REFERENCE.md](docs/TOOLS_REFERENCE.md) |
| Аудит (для безопасников) | [docs/AUDIT_LOG.md](docs/AUDIT_LOG.md) |
| English README | [i18n/README.en.md](i18n/README.en.md) |
| OpenAPI-обзор | [specs/openapi.yaml](specs/openapi.yaml) |

## Быстрый старт

```bash
npm install -g mcp-b24
# или без установки:
npx -y mcp-b24
```

### Авторизация (на выбор)

**Вебхук** (проще):
```bash
export BX24_WEBHOOK_URL="https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/КОД_ВЕБХУКА/"
```

**OAuth-приложение** (портальный масштаб, авто-обновление):
```bash
export BX24_MODE=oauth
export BX24_DOMAIN=ВАШ_ПОРТАЛ.bitrix24.ru
export BX24_CLIENT_ID="..."
export BX24_CLIENT_SECRET="..."
export BX24_REFRESH_TOKEN="..."
```

Все переменные — в [`.env.example`](.env.example).

### Конфигурация клиентов MCP

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "bitrix24": {
      "command": "npx",
      "args": ["-y", "mcp-b24"],
      "env": {
        "BX24_WEBHOOK_URL": "https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/КОД_ВЕБХУКА/",
        "BX24_CONFIRM_DESTRUCTIVE": "true"
      }
    }
  }
}
```

Windows (cmd): `"command": "cmd", "args": ["/c", "npx", "-y", "mcp-b24"]`.

**Cursor** (`.cursor/mcp.json`) — тот же блок `mcpServers`.
**VS Code** (`.vscode/mcp.json`) — ключ `servers` вместо `mcpServers`.
**Codex CLI:** `codex mcp add bitrix24 --env BX24_WEBHOOK_URL=... -- npx -y mcp-b24`.
**Cline / Roo Code** — блок `mcpServers` как для Claude Desktop.

**Streamable HTTP:**
```bash
BX24_TRANSPORT=http BX24_HTTP_PORT=3000 BX24_WEBHOOK_URL="..." npx mcp-b24
# http://127.0.0.1:3000/mcp
```

**Docker:**
```bash
docker build -t mcp-b24 .
docker run --rm -e BX24_WEBHOOK_URL="..." mcp-b24          # stdio
docker compose up                                                   # HTTP (см. docker-compose.yml)
```

## Инструменты (28 доменных + 2 generic)

**CRM:** `bx24_crm_leads`, `bx24_crm_deals`, `bx24_crm_contacts`, `bx24_crm_companies`, `bx24_crm_invoices`, `bx24_crm_products`, `bx24_crm_activities`, `bx24_crm_requisites`, `bx24_crm_duplicates`, `bx24_smart_processes`.
**collab:** `bx24_tasks`, `bx24_projects`, `bx24_disk`, `bx24_im`, `bx24_im_chat`, `bx24_conf`, `bx24_calendar`.
**org:** `bx24_users`, `bx24_departments`, `bx24_time`, `bx24_hr`.
**biz:** `bx24_lists`, `bx24_mail`, `bx24_reports`, `bx24_marketing`, `bx24_workflows`, `bx24_telephony`, `bx24_events`.
**generic:** `bx24_batch` (≤50 вызовов), `bx24_call` (любой REST-метод по имени).

Каждый доменный инструмент — **action-based**: операция выбирается параметром `action`. Полный реестр действий — в [docs/TOOLS_REFERENCE.md](docs/TOOLS_REFERENCE.md).

## Примеры запросов

- «Создай лид Иван, телефон +7…» → `bx24_crm_leads action=add`
- «Покажи мои задачи на сегодня» → `bx24_tasks action=list`
- «Загрузи PDF в "Договоры 2026" и скинь ссылку в чат "Партнёры"» → `bx24_disk` + `bx24_im_chat`
- «Запусти бизнес-процесс согласования по сделке #456» → `bx24_workflows action=start`
- «Удали компанию ООО "Старая фирма"» → `bx24_crm_companies action=delete` (попросит подтверждение)

## Разработка

```bash
npm install
npm run build        # tsc → dist/
npm test             # 73 теста
npm run test:coverage
npm start            # node dist/index.js
```

Подробно: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md).

## Лицензия

MIT © Penzin Konstantin ([github.com/kostikpenzin](https://github.com/kostikpenzin))