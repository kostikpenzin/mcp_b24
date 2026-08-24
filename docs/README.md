# Документация mcp-b24

Полный MCP-сервер над REST API Битрикс24: 28 доменных инструментов + `bx24_batch` + `bx24_call`, ~290 действий, авторизация webhook/OAuth, локализация RU/EN, аудит деструктивных операций.

Документация разделена по аудиториям (по ТЗ §11):

| Файл | Аудитория | Назначение |
|---|---|---|
| [USER_GUIDE.md](USER_GUIDE.md) | Обычные сотрудники | Установка, общение с AI-агентом, повседневные кейсы |
| [SELLER_GUIDE.md](SELLER_GUIDE.md) | Менеджеры CRM / РОП / HR / админы | Роле-специфичные workflows и рецепты |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Разработчики | Архитектура, data-driven framework, добавление инструмента, тесты, сборка, публикация |
| [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) | Все | Полный реестр 30 инструментов и действий |
| [AUDIT_LOG.md](AUDIT_LOG.md) | Админы / безопасники | Формат и политика аудита деструктивных операций |

Дополнительно:
- Английский README — [`../README.md`](../README.md). Русский README — [`../i18n/README.ru.md`](../i18n/README.ru.md).
- OpenAPI-обзор — [`specs/openapi.yaml`](../specs/openapi.yaml).

## Быстрый старт

```bash
npm install -g mcp-b24
export BX24_WEBHOOK_URL="https://ВАШ_ПОРТАЛ.bitrix24.ru/rest/1/КОД/"
npx -y mcp-b24
```

Конфиги клиентов (Claude Desktop, Cursor, VS Code, Codex CLI, Cline/Roo) — в корневом [README.md](../README.md).