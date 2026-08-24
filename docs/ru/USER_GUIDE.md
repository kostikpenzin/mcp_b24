# Руководство пользователя (USER_GUIDE)

**mcp-b24** — это AI-ассистент для вашего портала Битрикс24. Подключив его к AI-клиенту (Claude, Cursor, VS Code, Codex CLI), вы управляете CRM (лиды, сделки, контакты, компании, коммерческие предложения, умные процессы), задачами, чатами, открытыми линиями, чат-ботами, файлами, календарём, почтой, телефониями, бизнес-процессами, генератором документов, торговым каталогом и складом **обычными фразами**. Сервер сам выполняет реальные действия на портале.

В отличие от официального MCP Битрикс24 (только справочник документации), этот сервер **реально делает** запросы: создаёт лиды, ставит задачи, отправляет сообщения, запускает бизнес-процессы.

## Что нужно для начала

1. Администратор один раз настраивает авторизацию (вебхук или OAuth) — см. [DEVELOPER_GUIDE → Авторизация](DEVELOPER_GUIDE.md).
2. Вы подключаете сервер в своём MCP-клиенте — см. корневой [README](../README.md).
3. Дальше пишете ассистенту на естественном языке.

## 5 правил общения

1. **Говорите конкретно**: «создай лид Иван, телефон +7…», а не «заведи кого-нибудь».
2. **Уточняйте ID, если есть**: «обнови сделку №456», «поставь задачу Анне (id 12)».
3. **Подтверждайте удаления**: при включённой защите сервер сначала спросит подтверждение — напишите «да/подтверждаю».
4. **Не знаете поля — спросите**: «покажи поля лида» → агент вызовет `action=fields`.
5. **Массовое — через batch**: «создай 5 лидов сразу» — агент использует `bx24_batch`.

## 45 повседневных кейсов (простым языком)

1. **«Покажи мои задачи на сегодня»** → `bx24_tasks action=list` (RESPONSIBLE_ID=current, DEADLINE=today).
2. **«Создай встречу с Петровым завтра в 15:00»** → `bx24_calendar action=event_add`.
3. **«Загрузи PDF-договор в "Договоры 2026" и скинь ссылку в чат "Партнёры"»** → `bx24_disk action=file_upload` → `file_getExternalLink` → `bx24_im_chat action=sendMessage`.
4. **«Собери конференцию с отделом продаж в 16:00»** → `bx24_conf action=create` + `bx24_calendar action=event_add`.
5. **«Найди лиды за сегодня без ответственного»** → `bx24_crm_leads action=list` (DATE_CREATE>=today, ASSIGNED_BY_ID=null).
6. **«Сделай отчёт по воронке "Продажи"»** → `bx24_reports action=deal_pipeline`.
7. **«Пригласи нового сотрудника Иванова, отдел IT»** → `bx24_hr action=invite`.
8. **«Отправь письмо клиенту про готовность заказа»** → `bx24_mail action=message_send`.
9. **«Создай смарт-процесс "Закупки"»** → `bx24_smart_processes action=type_add` + поля.
10. **«Найди дубли контактов и предложи объединить»** → `bx24_crm_duplicates action=findbycomm` → `mergeBatch` (с подтверждением).
11. **«Запусти бизнес-процесс согласования по сделке #456»** → `bx24_workflows action=start`.
12. **«Заведи сделку из чата»** → `bx24_im_chat` (история) → `bx24_crm_companies/contacts/deals action=add`.
13. **«Поставь задачу отделу, дедлайн пятница»** → `bx24_departments` → `bx24_users` → `bx24_tasks action=add`.
14. **«Добавь товар "Стул", цена 5000, остаток 20»** → `bx24_crm_products action=product_add` + `price_add`.
15. **«Покажи всех сотрудников отдела маркетинга»** → `bx24_departments` → `bx24_users action=search`.
16. **«Открой рабочий день / закрой день с отчётом»** → `bx24_time action=status_open / status_close`.
17. **«Сделай коммерческое предложение по сделке #456 и приложи PDF»** → `bx24_crm_quotes action=add` → `bx24_crm_documents action=document_add` (шаблон → документ).
18. **«Сгенерируй договор из шаблона №3 для компании #88»** → `bx24_crm_documents action=document_add` (templateId, entityId, entityType).
19. **«Добавь валюту EUR, курс 100, и сделай её базовой»** → `bx24_crm_currency action=add` → `base_set`.
20. **«Покажи все заявки с веб-форм за неделю»** → `bx24_crm_webform action=result_list` (фильтр по дате).
21. **«Откуда пришёл лид? покажи UTM»** → `bx24_crm_tracking action=trace_list` (фильтр по ENTITY_ID).
22. **«Проведи приходный складской документ, +50 стульев»** → `bx24_crm_products action=document_add` → `document_conduct` (с подтверждением).
23. **«Настрой шаблон recurring-сделки — ежемесячное продление»** → `bx24_crm_deals action=recurring_add` (dealId + расписание).
24. **«Открой линию поддержки и ответь на ждущий диалог»** → `bx24_openlines action=config_list` → `operator_answer`.
25. **«Зарегистрируй чат-бот "Помощник", который отвечает на /faq»** → `bx24_bots action=bot_register` → `command_register`.
26. **«Добавь дело "Отправить счёт" к сделке #456»** → `bx24_crm_activities action=todo_add` (OWNER_ID, OWNER_TYPE_ID=2).
27. **«Преврати письмо в задачу для Анны»** → `bx24_mail action=message_createtask` (messageId).
28. **«Закрепи задачу #77 за потоком "Срочные" и переведи в стадию "На проверке"»** → `bx24_tasks action=addToFlow` → `moveToStage`.
29. **«Создай проект "Миграция сайта" и добавь в него три задачи»** → `bx24_projects action=create` → `bx24_tasks action=add` (привязать к группе проекта).
30. **«Пригласи Анну и Петра в проект №5 исполнителями»** → `bx24_projects action=user_add` (по пользователю, role).
31. **«Отправь личное сообщение Анне и пни команду системным уведомлением»** → `bx24_im action=message_add` → `notify_system_add`.
32. **«Отметь все сообщения в диалоге №42 прочитанными и покажи последние 20»** → `bx24_im action=dialog_read_all` → `dialog_messages_list`.
33. **«Создай счёт по сделке #456, стадия "Оплачено"»** → `bx24_crm_invoices action=add` (entityTypeId=31, OWNER_ID=456) → `update` (STAGE_ID).
34. **«Добавь реквизиты компании для компании #88 — ИНН, КПП и счёт»** → `bx24_crm_requisites action=preset_list` → `add` (presetId) → `bankdetail_add`.
35. **«Свяжи реквизиты №10 со сделкой #456»** → `bx24_crm_requisites action=link_register` (entityTypeId=2, entityId=456).
36. **«Создай список обзвона "Мартовская кампания" из лидов [1,2,3] и начни звонить»** → `bx24_crm_calllists action=add` (ENTITY_TYPE=LEAD, ID лидов) → `start`.
37. **«Как сделки переходили по стадиям в этом месяце? покажи движение воронки»** → `bx24_crm_stagehistory action=list` (фильтр по ownerId/category и дате).
38. **«Добавь адрес доставки для контакта #12»** → `bx24_crm_addresses action=add` (type + поля адреса) → при необходимости `byclient`.
39. **«Запусти правило автоматизации "Уведомить менеджера" для лида #100»** → `bx24_crm_automation action=trigger` (DOCUMENT_ID, code) или `trigger_execute` (id).
40. **«Позвони клиенту на +7 495 … с портала и проиграй голосовое приветствие»** → `bx24_telephony action=voximplant_infocall_startwithsound` (FROM, TO, FILE) или `voximplant_callback_start`.
41. **«Подпишись на событие `onCrmLeadAdd`, чтобы мой обработчик работал на новые лиды»** → `bx24_events action=bind` (event, handler, auth).
42. **«Добавь 50 лидов из этого списка одним запросом, затем свяжи каждый со сделкой через ссылки на результаты»** → `bx24_batch` с `cmd: { lead_0: "crm.lead.add?fields[...]", deal_0: "crm.deal.add?fields[CONTACT_ID]=$result[lead_0]" }` (≤50 команд).
43. **«Вызови `entity.item.property.add` напрямую — он ещё не обёрнут в инструмент»** → `bx24_call method=entity.item.property.add` (escape-hatch; произвольные params).
44. **«Удали компанию #88, но сначала подтверди»** → первый `bx24_crm_companies action=delete id=88` вернёт `requiresConfirmation` preview (при `BX24_CONFIRM_DESTRUCTIVE=true`); повтори с `confirm: true` для выполнения.
45. **«Кто сегодня пытался что-то удалить? покажи отказанные попытки»** → посмотри `audit.log`: строки с `result: "denied"` — деструктивные вызовы, запрошенные без подтверждения, плюс `ok`/`error` для выполненных.

## Двухфазное подтверждение (деструктивные действия)

При `BX24_CONFIRM_DESTRUCTIVE=true` сервер не выполняет деструктивное действие (delete, remove, complete, close, kick, cancel, stop, mute, unbind, clear, markDeleted, kill, …) с первого вызова. Вместо этого он возвращает структурированный `requiresConfirmation` preview и пишет в аудит строку с `result: "denied"`. Повтори тот же вызов с `confirm: true` для выполнения — сервер выполнит его и запишет `result: "ok"`/`"error"`.

- Это касается **всех** инструментов, включая generic: `bx24_batch` (любая команда, метод которой подходит под деструктивные ключевые слова) и `bx24_call` (любой метод, выглядящий деструктивным).
- `bx24_call` отклоняет `method: "batch"` — используй `bx24_batch`, который обеспечивает лимит 50 команд и то же подтверждение.

## Частые ошибки

- **«Агент не отвечает / не находит»** — проверьте права вебхука (scope) на нужный модуль.
- **«Не хватает прав»** — администратор должен выдать интеграции доступ к CRM/задачам/чату и т.д.
- **«Не нашёл контакт»** — попросите поиск по телефону/email: `bx24_crm_contacts action=list` с filter.

## Безопасность

- Webhook-секрет и OAuth-токены **не попадают** в переписку и логи.
- Деструктивные действия при `BX24_CONFIRM_DESTRUCTIVE=true` требуют подтверждения и пишутся в `audit.log` (см. [AUDIT_LOG](AUDIT_LOG.md)).
- Действия выполняются от имени авторизованного пользователя; права портала соблюдаются.

## Куда обращаться

По вопросам доступа и прав — к администратору портала. Инциденты с аудитом — к безопаснику (см. [AUDIT_LOG](AUDIT_LOG.md)).