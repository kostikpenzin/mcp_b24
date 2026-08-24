# MCP-сервер Bitrix24 — Дизайн-спецификация

Дата: 2026-08-24
Статус: draft (на утверждении)
Рабочая директория: `E:\my_project\mcp_b24`
Пакет npm: `mcp-bitrix24` (директория `mcp_b24`)

## 1. Контекст и цель

Официальный MCP-сервер Битрикс24 (`https://mcp-dev.bitrix24.tech/mcp`, Streamable HTTP, без авторизации) — это **только справочник документации**: он отдаёт AI-ассистенту актуальные описания REST-методов, параметров и допустимых значений, но **не выполняет реальные вызовы** к порталу. Нейросеть без него придумывает несуществующие методы.

Цель этого проекта — MCP-сервер, который **реально выполняет REST-вызовы к порталу Bitrix24** (CRUD по CRM, задачам, чатам, файлам, пользователям, календарю), по образцу высококачественного референсного пакета `mcp-iva-mcu` (TypeScript, action-based tools, AJV-валидация, destructive-confirmation, авто-реавторизация, i18n RU/EN, тесты на vitest, публикация в npm).

### Чем превосходит официальный MCP Битрикс24
- Выполняет реальные вызовы, а не только отдаёт документацию.
- Авторизация: входящий вебхук **и** OAuth-приложение с автообновлением токена.
- Двойной транспорт: stdio (Claude Desktop/Cursor/Codex) **и** Streamable HTTP (удалённые/мультипользовательские клиенты).
- Защита от деструктивных действий (`B24_CONFIRM_DESTRUCTIVE`).
- Batch-инструмент + универсальный `b24_call` (вызов любого REST-метода по имени — escape-hatch для методов, ещё не обёрнутых в инструменты).
- Авторазбиение на страницы (auto-paginate) и троттлинг запросов.
- Натуралистичная мапа «русский/английский → инструмент+action» в `instructions`.
- Полные unit-тесты (vitest) и двуязычный README.

## 2. Нефункциональные требования

- Язык: TypeScript (ESM, `NodeNext`), Node ≥ 18.
- Транспорт: `StdioServerTransport` + `StreamableHTTPServerTransport` из `@modelcontextprotocol/sdk`.
- Зависимости: `@modelcontextprotocol/sdk`, `ajv`, `ajv-formats` (как в референсе). Dev: `typescript`, `vitest`, `@vitest/coverage-v8`, `shx`, `rimraf`, `@types/node`.
- Сборка: `tsc` → `dist/`, `shx chmod +x dist/*.js`, ESM-вход `dist/index.js` с shebang.
- Тесты: `vitest run`, цель — покрытие ядра (config, api-client, framework, validate, error, transport, ключевые инструменты).
- Качество: без `any` в публичных интерфейсах, понятные ошибки, чистая изоляция модулей (каждый файл — одна ответственность), идемпототическая структура как в референсе.

## 3. Авторизация

API-клиент автоопределяет режим по env-переменным:

### 3.1 Входящий вебхук (simplest)
- `B24_WEBHOOK_URL` = `https://<portal>.bitrix24.<ru|com|...>/rest/<user_id>/<webhook_code>/`
- Метод вызывается как `{webhookUrl}{method}.json` (auth уже вшит в URL).
- Без обновления токенов; действует от имени пользователя, создавшего вебхук.

### 3.2 OAuth-приложение
- `B24_PORTAL_URL` = `https://<portal>.bitrix24.ru`
- `B24_CLIENT_ID`, `B24_CLIENT_SECRET`, `B24_REFRESH_TOKEN` (или `B24_ACCESS_TOKEN` + `B24_REFRESH_TOKEN`).
- access_token передаётся как `?auth=<token>` (или заголовком). Срок жизни ~1 час.
- При ответе с `expired_token`/`invalid_token`/HTTP 401 → POST `https://oauth.bitrix24.ru/oauth/token/` (`grant_type=refresh_token`), обновить, повторить запрос один раз (как `canReauth()` в референсе).
- Опционально `B24_OAUTH_SERVER` для on-premise (по умолчанию `https://oauth.bitrix24.ru`).

### 3.3 Приоритет
- Если задан `B24_WEBHOOK_URL` — используется вебхук (проще).
- Иначе требуется OAuth-набор; иначе `AUTH_NOT_CONFIGURED`.

## 4. REST-клиент (`src/api-client.ts`)

Зеркалит `IvaApiClient`, адаптированный под специфику Битрикс24:

- URL: `{base}/rest/{method}.json` (вебхук: base уже содержит `rest/<user>/<code>/` → `{webhookUrl}{method}.json`).
- Метод: всегда **GET** с query-параметрами для простых вызовов, либо **POST** с JSON-телом для больших/методов `add`/`update`/`batch` (Битрикс24 принимает оба; используем POST при наличии body, GET иначе). Реализация: `callMethod(method, params?, opts?)`.
- Авторизация: для OAuth добавлять `auth` в query (POST — в body) либо заголовок.
- Таймаут 30 c (`AbortSignal.timeout`).
- **Разбор ошибок:** Битрикс24 возвращает HTTP 200 с полями `error`/`error_description`/`error_information`. Клиент обязан проверять `error` в JSON-теле и бросать `Bitrix24ApiError(status, message, reason, type)` (status = 200, но reason = `error`-код).
- **Пагинация:** списочные методы принимают `start`, `order`, `filter`, `select`; ответ содержит `next`, `total`. Опция `B24_AUTO_PAGINATE=true` (по умолчанию false) — клиент собирает все страницы до лимита `B24_MAX_ROWS` (по умолчанию 5000).
- **Троттлинг:** опциональный лимит `B24_RPS` (запросов/сек); по умолчанию выключен. Очередь запросов с минимальным интервалом между вызовами.
- **Batch:** метод `batch` (`halt`, `cmd`) — отдельный инструмент (`b24_batch`), поддерживает ссылки `$result[...]`.
- Заголовок `User-Agent: mcp-bitrix24/<version>`.

## 5. Архитектура каталога

```
mcp_b24/
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
├─ Dockerfile
├─ .dockerignore / .gitignore / .npmignore
├─ README.md            (EN)
├─ i18n/README.ru.md
├─ docs/superpowers/specs/2026-08-24-bitrix24-mcp-design.md
├─ specs/               (по необходимости — выгрузки методов/полей для справки)
└─ src/
   ├─ index.ts          (точка входа: config → transport → server)
   ├─ config.ts         (loadConfig: env, валидация)
   ├─ constants.ts      (VERSION, API_VERSION = "REST v2 + REST 3.0", OAUTH_SERVER)
   ├─ types.ts          (Bitrix24Config, ToolDefinition, ToolResult, HttpMethod, AuthMode)
   ├─ error.ts          (Bitrix24ApiError, errorResult, apiErrorResult, successResult)
   ├─ api-client.ts     (Bitrix24ApiClient: webhook + OAuth + auto-refresh + пагинация + троттлинг)
   ├─ transport.ts      (выбор stdio | streamable-http, graceful shutdown)
   ├─ tools/
   │  ├─ framework.ts   (createActionTool — как в референсе)
   │  ├─ params.ts      (P — каталог переиспользуемых схем под Битрикс24)
   │  ├─ validate.ts    (AJV)
   │  ├─ index.ts       (getAllTools — агрегация)
   │  ├─ batch.ts       (b24_batch)
   │  ├─ call.ts        (b24_call — универсальный вызов по имени метода)
   │  ├─ crm/lead.ts, contact.ts, company.ts, deal.ts, activity.ts, userfield.ts, product.ts
   │  ├─ tasks/task.ts, checklist.ts
   │  ├─ im/chat.ts, message.ts, notify.ts
   │  ├─ disk/file.ts, folder.ts
   │  ├─ user/user.ts
   │  └─ calendar/event.ts
   └─ *.test.ts         (рядом с модулями)
```

## 6. Каркас инструмента (`createActionTool`)

Повторяет референс: один инструмент на домен, выбор операции через `action` (enum). Маппинг `action → {method, httpVerb, path|restMethod, pathParams?, queryParams?, bodyParam?, bodyWrapper?, emptyBody?, rawBody?}`. Разница с референсом: вместо `path` (REST path-стиль IVA) — `restMethod` (метод Битрикс24, напр. `crm.lead.add`), т.к. Битрикс24 вызывает методы по имени, а не по URL-path.

```
interface ActionMapping {
  restMethod: string;      // e.g. "crm.lead.add"
  httpVerb?: "GET"|"POST"; // по умолчанию POST при наличии body, иначе GET
  pathParams?: string[];   // логические имена (для справки/валидации)
  queryParams?: string[];
  bodyParam?: string;
  bodyWrapper?: string;
  emptyBody?: boolean;
  rawBody?: boolean;
}
```

`DESTRUCTIVE_KEYWORDS`: `delete, remove, detach, exclude, stop, cancel, reject, complete, close, mute, leave, kick`. Подтверждение через `confirm: true` при `B24_CONFIRM_DESTRUCTIVE=true`.

## 7. Инструменты (первая версия — 18 инструментов)

| # | Инструмент | REST-методы | Действия (action) |
|---|------------|------------|--------------------|
| 1 | `b24_lead` | `crm.lead.*` | add, get, list, update, delete, fields |
| 2 | `b24_contact` | `crm.contact.*` | add, get, list, update, delete, fields |
| 3 | `b24_company` | `crm.company.*` | add, get, list, update, delete, fields |
| 4 | `b24_deal` | `crm.deal.*` | add, get, list, update, delete, fields |
| 5 | `b24_activity` | `crm.activity.*` | add, get, list, update, delete |
| 6 | `b24_crm_userfield` | `crm.<entity>.userfield.*` | add, get, list, update, delete (entity ∈ lead/contact/company/deal) |
| 7 | `b24_product` | `crm.product.*` | add, get, list, update, delete |
| 8 | `b24_task` | `tasks.task.*` | add, get, list, update, delete, complete, delegate, defer, renew, start, pause |
| 9 | `b24_task_checklist` | `task.checklistitem.*` | add, get, list, update, delete, complete |
| 10 | `b24_chat` | `im.chat.*` | create, get, add_user, remove_user, update, leave, set_title, list, mute |
| 11 | `b24_message` | `im.message.*`, `im.dialog.*` | add, update, delete, dialog_get, dialog_messages_list |
| 12 | `b24_notify` | `im.notify.*` | add, system, delete |
| 13 | `b24_file` | `disk.file.*` | get, download, upload, rename, delete, search |
| 14 | `b24_folder` | `disk.folder.*` | get, getchildren, add, uploadfile, delete |
| 15 | `b24_user` | `user.*` | get, current, search, fields, get_by_ids |
| 16 | `b24_calendar_event` | `calendar.event.*` | add, get, list, update, delete, get_nearest |
| 17 | `b24_batch` | `batch` | run (cmd + halt + постраничный сбор) |
| 18 | `b24_call` | (любой) | invoke — вызов любого REST-метода по имени с произвольными params (escape-hatch; под destructive-confirmation при DELETE-семантике) |

Каждый инструмент несёт двуязычные `actionDescriptions` (RU/EN ключевые фразы в description), чтобы AI-ассистент корректно мапил natural language.

## 8. Конфигурация (env)

| Переменная | Обяз. | Описание |
|---|---|---|
| `B24_WEBHOOK_URL` | режим webhook | URL вебхука `.../rest/<user>/<code>/` |
| `B24_PORTAL_URL` | режим OAuth | URL портала `https://portal.bitrix24.ru` |
| `B24_CLIENT_ID` | OAuth | ID приложения |
| `B24_CLIENT_SECRET` | OAuth | секрет |
| `B24_REFRESH_TOKEN` | OAuth | refresh-токен |
| `B24_ACCESS_TOKEN` | опц. | готовый access-токен (иначе вычисляется из refresh) |
| `B24_OAUTH_SERVER` | опц. | `https://oauth.bitrix24.ru` (по умолчанию) |
| `B24_CONFIRM_DESTRUCTIVE` | опц. | `true` — требовать `confirm: true` для деструктивных action |
| `B24_AUTO_PAGINATE` | опц. | `true` — авто-сбор страниц списков (до `B24_MAX_ROWS`) |
| `B24_MAX_ROWS` | опц. | лимит строк при авто-пагинации (5000) |
| `B24_RPS` | опц. | лимит запросов/сек (троттлинг) |
| `B24_TRANSPORT` | опц. | `stdio` (по умолчанию) \| `http` |
| `B24_HTTP_HOST` | опц. | хост HTTP-транспорта (`127.0.0.1`) |
| `B24_HTTP_PORT` | опц. | порт HTTP-транспорта (`3000`) |
| `B24_HTTP_PATH` | опц. | путь эндпоинта (`/mcp`) |

## 9. `instructions` сервера

Большой блок natural-language mapping (как в референсе), сгруппированный по доменам: CRM (лиды/контакты/компании/сделки/дела), Задачи, Чаты и сообщения, Файлы, Пользователи, Календарь, Batch, Универсальный вызов. RU/EN ключевые слова в скобках. Явные указания про деструктивные действия, обязательные поля (`TITLE`, `fields`), пагинацию (`start`), и что для методов вне обёрнутых — использовать `b24_call`.

## 10. Транспорт (`src/transport.ts`)

- `B24_TRANSPORT=stdio` (по умолчанию): `StdioServerTransport`.
- `B24_TRANSPORT=http`: `StreamableHTTPServerTransport` на `http`-сервере, маршрут `B24_HTTP_PATH` (по умолчанию `/mcp`), host/port из env. Поддержка `initialize` и `session management` из SDK.
- Graceful shutdown: `SIGINT`/`SIGTERM` → `server.close()` + закрытие транспорта/HTTP-сервера.

## 11. Тестирование

- `config.test.ts`: разбор env, приоритет webhook/OAuth, ошибки валидации.
- `api-client.test.ts` (с замоканным `fetch`): формирование URL для webhook vs OAuth, авто-refresh на 401/expired_token, разбор ошибок из тела (HTTP 200 + `error`), авто-пагинация по `next`, троттлинг.
- `framework.test.ts`: routing action→mapping, деструктив-confirmation, pathParams/queryParams/bodyWrapper/rawBody.
- `validate.test.ts`: AJV-ошибки.
- `error.test.ts`: errorResult/apiErrorResult/successResult.
- `mcp-protocol.test.ts`: ListTools/CallTool через in-memory transport.
- `tools/index.test.ts`: список инструментов, имена уникальны.
- smoke-тесты инструментов (маппинги, без реальной сети): `tools/*.test.ts` для репрезентативных (lead, task, chat, batch, call).
- Цель: ≥ 60 тестов, как у референса.

## 12. Публикация и дистрибуция

- `npm publish` (MIT, автор как у референса). `prepublishOnly`: clean → build → test.
- `npx -y mcp-bitrix24` — запуск без глобальной установки.
- Dockerfile (node:20-alpine, COPY dist, CMD node dist/index.js).
- README с конфигами для Claude Desktop, Cursor, VS Code, Codex CLI (stdio) и HTTP-клиентов; RU README в `i18n/`.
- Примеры сценариев: создать лид, найти контакты по телефону, отправить сообщение в чат, поставить задачу, выгрузить файл, пакетные операции через batch.

## 13. Риски и ограничения

- Битрикс24 не имеет единой OpenAPI-спецификации → маппинги собираются вручную по документации (как `params.ts`/tools в референсе). `b24_call` покрывает пробелы.
- REST vs REST 3.0: использовать классические методы (`crm.*`, `tasks.task.*`, `im.*`) как стабильные; REST 3.0 — позже.
- Троттлинг: у порталов есть лимиты; `B24_RPS` опционален, не заменяет серверную защиту.
- Загрузка/скачивание файлов (disk.file.download/upload) — бинарные данные; через MCP возвращать как base64-text или сохранять путь (реализовать поэтапно: сначала метаданные, потом бинарный контент).

## 14. План реализации (последовательность)

1. Скаффолд: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`/`.npmignore`/`.dockerignore`, `src/constants.ts`, `src/types.ts`, `src/error.ts`.
2. `src/config.ts` + тесты.
3. `src/api-client.ts` (webhook + OAuth + auto-refresh + ошибки + пагинация + троттлинг) + тесты.
4. `src/tools/params.ts`, `src/tools/validate.ts`, `src/tools/framework.ts` + тесты.
5. Инструменты по доменам (crm → tasks → im → disk → user → calendar), тесты-маппинги на каждый.
6. `b24_batch`, `b24_call` + тесты.
7. `src/tools/index.ts` (агрегация) + тест.
8. `src/transport.ts` (stdio + HTTP) + `src/index.ts` (server + instructions).
9. `mcp-protocol.test.ts` (интеграционный in-memory).
10. Dockerfile, README (EN) + `i18n/README.ru.md`.
11. Сборка, прогон тестов, smoke-проверка вручную (вебхук на тестовом портале).
12. Публикация в npm.

## 15. Критерии готовности

- `npm run build` без ошибок; `npm test` зелёный.
- Документированы все 18 инструментов с RU/EN action-descriptions.
- stdio и HTTP транспорты работоспособны.
- Вебхук и OAuth (с авто-refresh) работают на тестовом портале.
- README содержит конфиги для всех ключевых MCP-клиентов.