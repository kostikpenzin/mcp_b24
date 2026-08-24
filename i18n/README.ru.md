<div align="center">

# MCP-сервер для Битрикс24

[![npm version](https://img.shields.io/npm/v/mcp-b24.svg)](https://www.npmjs.com/package/mcp-b24)
[![npm downloads](https://img.shields.io/npm/dm/mcp-b24.svg)](https://www.npmjs.com/package/mcp-b24)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
[![tests](https://img.shields.io/badge/tests-75-brightgreen.svg)](../CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-green.svg)](https://nodejs.org/)
[![MCP protocol](https://img.shields.io/badge/protocol-MCP-purple.svg)](https://modelcontextprotocol.io)
[![platform](https://img.shields.io/badge/platform-Bitrix24-blue.svg)](https://www.bitrix24.com)

[![dependencies](https://img.shields.io/badge/dependencies-0%20vulnerabilities-brightgreen.svg)](#безопасность)
[![secrets](https://img.shields.io/badge/secrets-none%20hardcoded-brightgreen.svg)](#безопасность)
[![malware](https://img.shields.io/badge/malware-none%20detected-brightgreen.svg)](#безопасность)

**30 инструментов** · **~290 действий** · **Bitrix24 REST 1.0 + 3.0** · **75 тестов**

MCP-сервер для платформы **Битрикс24**.
Оборачивает REST API Битрикс24 (CRM, задачи, чаты, файлы, календарь, HR, умные
процессы, почта, телефония, бизнес-процессы, события) в 30 инструментов, которые
AI-агент вызывает напрямую — и **реально выполняет запросы** к порталу (в
отличие от официального MCP Битрикс24, который только отдаёт документацию).

[Установка](#установка) ·
[Настройка](#настройка-mcp-клиентов) ·
[Возможности](#возможности) ·
[Инструменты](#обзор-инструментов) ·
[Сценарии](#сценарии-использования) ·
[Разработка](#разработка) ·
[пакет npm](https://www.npmjs.com/package/mcp-b24)

**Языки:** [English](../README.md) · Русский

</div>

---

## Портал и подписка

Этот MCP-сервер оборачивает REST API [**Битрикс24**](https://www.bitrix24.com).
**Битрикс24** — единое рабочее пространство: CRM, задачи, проекты, чаты,
видеозвонки, документы, почта, календарь, HR, бизнес-процессы, телефония. Доступен
в облаке (`*.bitrix24.ru` / `*.bitrix24.com`) и on-premise.

> ⚠️ **Для работы нужен портал Битрикс24.** Требуется либо **входящий вебхук**
> (`BX24_WEBHOOK_URL`), либо **OAuth-приложение** (`BX24_DOMAIN` +
> `BX24_CLIENT_ID` + `BX24_CLIENT_SECRET` + `BX24_REFRESH_TOKEN`). Вебхук
> создаётся в *Разработчикам → Входящий вебхук*; OAuth-приложение — на
> `oauth.bitrix24.ru`.

➡️ Подробнее: [bitrix24.com](https://www.bitrix24.com) · документация REST:
[apidocs.bitrix24.ru](https://apidocs.bitrix24.ru)

---

## Версии API

| API | Версия | Базовый путь | Авторизация | Модули |
|-----|--------|-------------|------------|--------|
| Bitrix24 REST | **1.0 + 3.0** | `/rest/<method>.json` | вебхук или OAuth 2.0 | CRM, tasks, IM, disk, calendar, user, catalog, lists, mail, telephony, bizproc, HR, timeman, events |

## Установка

### Требования

- Node.js 18+
- Активный портал [Битрикс24](https://www.bitrix24.com)
- Учётные данные: вебхук **или** OAuth-приложение

### Установка из npm

```bash
npm install -g mcp-b24
# или запуск без установки
npx -y mcp-b24
```

### Переменные окружения

| Переменная | Обяз. | Описание |
|------------|-------|----------|
| `BX24_MODE` | Нет | `webhook` или `oauth` (авто-детект) |
| `BX24_WEBHOOK_URL` | вебхук | URL вебхука: `https://portal.bitrix24.ru/rest/<user_id>/<secret>/` |
| `BX24_DOMAIN` | oauth | Домен портала, напр. `portal.bitrix24.ru` |
| `BX24_CLIENT_ID` | oauth | OAuth client id |
| `BX24_CLIENT_SECRET` | oauth | OAuth client secret |
| `BX24_REFRESH_TOKEN` | oauth | Refresh-токен для авто-обновления |
| `BX24_ACCESS_TOKEN` | Нет | Готовый access-токен (иначе из refresh) |
| `BX24_OAUTH_SERVER` | Нет | `https://oauth.bitrix.info` (по умолчанию) |
| `BX24_CONFIRM_DESTRUCTIVE` | Нет | `true` — требовать `confirm: true` для деструктивных действий |
| `BX24_AUTO_PAGINATE` | Нет | `true` — авто-сбор страниц до `BX24_MAX_ROWS` |
| `BX24_MAX_ROWS` | Нет | Лимит строк при пагинации (5000) |
| `BX24_RATE_LIMIT_RPS` | Нет | Запросов/сек (≤2 не-Enterprise, ≤5 Enterprise; 2) |
| `BX24_RATE_LIMIT_BURST` | Нет | Burst token-bucket (50) |
| `BX24_DEFAULT_LANG` | Нет | `ru` или `en` (по умолчанию `ru`) |
| `BX24_LOG_LEVEL` | Нет | `silent` `error` `warn` `info` `debug` (`info`) |
| `BX24_AUDIT_LOG` | Нет | Путь JSONL-аудита деструктивных + auth-событий |
| `BX24_TRANSPORT` | Нет | `stdio` или `http` (`stdio`) |
| `BX24_HTTP_HOST/PORT/PATH` | Нет | HTTP-эндпоинт (`127.0.0.1:3000/mcp`) |

Можно:
- задать `BX24_WEBHOOK_URL` — проще всего, действует от имени создателя вебхука; обновление не нужно, или
- задать `BX24_DOMAIN` + OAuth — сервер сам обновляет access-токены (~1 ч) и использует `client_endpoint` из ответа OAuth.

### Подтверждение деструктивных действий

При `BX24_CONFIRM_DESTRUCTIVE=true` сервер требует явный `confirm: true` перед деструктивными действиями (delete, remove, complete, leave, kick, cancel, stop, close, mute, unbind, clear, markDeleted, kill …). Без него инструмент возвращает структурированный `requiresConfirmation` preview и **не выполняет** операцию. Каждое выполненное деструктивное действие пишется в JSONL-аудит (`BX24_AUDIT_LOG`). Если переменная не задана или `false` — действия выполняются без подтверждения (по умолчанию).

## Настройка MCP-клиентов

### Claude Desktop

Добавьте в `claude_desktop_config.json`:

**npx (рекомендуется):**

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

**Windows** — через `cmd /c`:

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
# http://127.0.0.1:3000/mcp
```

### Cursor — `.cursor/mcp.json`

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

### VS Code — `.vscode/mcp.json` (ключ `servers`)

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

### Из исходников

```bash
git clone https://github.com/kostikpenzin/mcp_b24.git
cd mcp_b24
npm install
npm run build
```

## Обзор инструментов

### 30 инструментов, ~290 действий

| Инструмент | Назначение | Группа |
|-----------|------------|--------|
| `bx24_crm_leads` | Лиды: CRUD, контакты, пользовательские поля, конвертация | CRM |
| `bx24_crm_deals` | Сделки + воронки, товарные позиции, привязки контактов | CRM |
| `bx24_crm_contacts` | Контакты: CRUD, привязки компаний, поля | CRM |
| `bx24_crm_companies` | Компании: CRUD, привязки контактов, поля | CRM |
| `bx24_crm_invoices` | Счета (SMART_INVOICE, entityTypeId=31) + стадии | CRM |
| `bx24_crm_products` | Каталог: товары, разделы, цены, склады, позиции | CRM |
| `bx24_crm_activities` | Дела (звонки/встречи/письма) + таймлайн | CRM |
| `bx24_crm_requisites` | Реквизиты + пресеты + привязки | CRM |
| `bx24_crm_duplicates` | Поиск и слияние дублей | CRM |
| `bx24_smart_processes` | Умные процессы: типы + элементы | CRM |
| `bx24_tasks` | Задачи: lifecycle + чек-листы + комментарии + время + потоки + стадии | collab |
| `bx24_projects` | Группы/проекты (соц. сеть) | collab |
| `bx24_disk` | Диск: хранилища, папки, файлы, версии, ссылки | collab |
| `bx24_im` | Мессенджер: сообщения, уведомления, поиск, счётчики | collab |
| `bx24_im_chat` | Чаты: создание, участники, mute, сообщения | collab |
| `bx24_conf` | Видеоконференции | collab |
| `bx24_calendar` | Календарь: события, разделы, доступность | collab |
| `bx24_users` | Пользователи: текущий, поиск, поля, CRUD | org |
| `bx24_departments` | Отделы / оргструктура | org |
| `bx24_time` | Учёт рабочего времени (timeman) | org |
| `bx24_hr` | HR: сотрудники, приглашение, увольнение, перевод | org |
| `bx24_lists` | Универсальные списки (инфоблоки) | biz |
| `bx24_mail` | Почта: ящики, сообщения, отправка, фильтры | biz |
| `bx24_reports` | Аналитика и отчёты | biz |
| `bx24_marketing` | Сегменты, рассылки, фильтры лидов | biz |
| `bx24_workflows` | Бизнес-процессы и роботы (bizproc) | biz |
| `bx24_telephony` | Телефония: внешние линии, звонки, SIP, voximplant | biz |
| `bx24_events` | Подписки на события + офлайн-очередь | biz |
| `bx24_batch` | Пакет из ≤50 вызовов (`$result[]`) | generic |
| `bx24_call` | Вызов любого REST-метода по имени (escape-hatch) | generic |

Каждый доменный инструмент **action-based**: операция выбирается параметром
`action`. Полный список действий — [`docs/ru/TOOLS_REFERENCE.md`](../docs/ru/TOOLS_REFERENCE.md) (EN: [`docs/en/`](../docs/README.md)).

## Возможности

Сервер понимает **естественный язык (русский и английский)** — не нужно знать
имена инструментов, просто опишите задачу.

### Что можно делать

- **CRM** — лиды/контакты/компании/сделки, воронки, дела, товарные позиции,
  пользовательские поля, реквизиты, дубли, умные процессы
- **Задачи и проекты** — создание, выполнение, делегирование, чек-листы,
  комментарии, затраченное время, потоки, группы/проекты
- **Чаты и мессенджер** — создание чатов, участники, сообщения, поиск, счётчики,
  уведомления
- **Файлы (Диск)** — загрузка/скачивание/перемещение, версии, публичные ссылки
- **Календарь** — события, разделы, доступность, ближайшие
- **HR и орг** — пользователи, отделы, учёт времени, приём/увольнение/перевод
- **Бизнес** — списки, почта, отчёты, маркетинг, бизнес-процессы, телефония,
  события
- **Batch и generic** — до 50 вызовов за раз; любой REST-метод по имени

### Безопасность

- Учётные данные (вебхук, OAuth-токены) **никогда** не попадают в переписку и не
  возвращаются в результатах
- Деструктивные действия требуют `confirm: true` (`BX24_CONFIRM_DESTRUCTIVE=true`)
  и пишутся в JSONL-аудит
- Лимиты соблюдаются через token-bucket; `QUERY_LIMIT_EXCEEDED` (503) и
  `OPERATION_TIME_LIMIT` (429) ретраятся с backoff
- Действия по паролям/логину исключены — авторизация через env-переменные

## Сценарии использования

### 1. Создать лид
> «Создай лид Иван Петров, телефон +79001234567, почта ivan@example.ru»
→ `bx24_crm_leads action=add` с `fields = { TITLE, PHONE[], EMAIL[] }`.

### 2. Мои задачи на сегодня
> «Покажи мои задачи на сегодня»
→ `bx24_tasks action=list` (RESPONSIBLE_ID=current, DEADLINE=today).

### 3. Передвинуть сделку
> «Передвинь сделку №456 на стадию «В работе»»
→ `bx24_crm_deals action=update` (STAGE_ID; стадии — `category_list`).

### 4. Сообщение в чат
> «Напиши в чат «Проект Альфа»: релиз сегодня в 18:00»
→ `bx24_im_chat action=sendMessage` (DIALOG_ID, MESSAGE).

### 5. Загрузить файл и дать ссылку
> «Загрузи PDF-договор в «Договоры 2026» и скинь ссылку в чат «Партнёры»»
→ `bx24_disk` → `file_upload` → `file_getExternalLink` → `bx24_im_chat sendMessage`.

### 6. Запустить бизнес-процесс
> «Запусти «Согласование с юристами» для сделки #456»
→ `bx24_workflows action=start` (templateId, documentId=["crm","DEAL",456]).

### 7. Отчёт по воронке
> «Сделай отчёт по воронке «Продажи»: сделки по этапам, средний чек»
→ `bx24_crm_deals list` + `bx24_reports funnel_stages`, агрегация.

## Разработка

```bash
npm install          # зависимости
npm run build        # TypeScript + chmod +x
npm run dev          # watch
npm test             # 75 тестов (vitest)
npm run test:coverage
npm start            # запуск
docker build -t mcp/bitrix24 .   # Docker-образ
npm publish          # публикация в npm (auto clean + build + test)
```

## Структура проекта

```
mcp_b24/
├── src/
│   ├── index.ts          # точка входа MCP-сервера
│   ├── server.ts         # сервер: регистрация/list/call + instructions
│   ├── config.ts         # конфигурация env (BX24_*)
│   ├── api-client.ts     # HTTP-клиент: webhook/OAuth, refresh, backoff, token-bucket
│   ├── error.ts          # обработка ошибок
│   ├── types.ts          # типы
│   ├── i18n/             # ru.ts, en.ts, index.ts
│   ├── audit/log.ts      # JSONL-аудит
│   ├── utils/            # logger, tokenBucket
│   ├── transport.ts      # stdio + Streamable HTTP
│   └── tools/
│       ├── framework.ts  # data-driven фреймворк
│       ├── params.ts     # переиспользуемые схемы
│       ├── index.ts      # регистрация 30 инструментов
│       ├── batch.ts / call.ts
│       ├── crm/  collab/  org/  biz/
├── docs/                 # en/ + ru/ (USER_GUIDE, SELLER_GUIDE, DEVELOPER_GUIDE, TOOLS_REFERENCE, AUDIT_LOG)
├── i18n/README.ru.md     # этот файл
├── specs/openapi.yaml
├── Dockerfile / docker-compose.yml / .env.example
├── LICENSE / CHANGELOG.md / package.json / tsconfig.json
```

## Лицензия

[MIT](../LICENSE)

## Автор

**Пензин Константин** — [GitHub](https://github.com/kostikpenzin) · [penzin85@gmail.com](mailto:penzin85@gmail.com)