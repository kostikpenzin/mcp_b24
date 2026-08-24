# Руководство для менеджеров и ролей (SELLER_GUIDE)

Готовые роле-специфичные сценарии и рецепты для повседневной работы. Копируйте формулировку в чат с AI-агентом.

## Для менеджера CRM (sales)

**Пайплайн лида**
- «Покажи новые лиды за неделю без касания» → `bx24_crm_leads action=list` (DATE_CREATE>=-7d, ASSIGNED_BY_ID не задан).
- «Квалифицируй лид #123: переведи в статус „В работе“, назначь ответственного Петрова» → `bx24_crm_leads action=update` (STATUS_ID, ASSIGNED_BY_ID).

**Потерянные сделки и повторные касания**
- «Покажи сделки в "Переговоры" старше 7 дней» → `bx24_crm_deals action=list` (STAGE_ID=..., <=DATE_MODIFY).
- «Запланируй звонок по сделке #456 на завтра 10:00» → `bx24_crm_activities action=add` (OWNER_ID=456, OWNER_TYPE_ID=2, TYPE_ID=3, START_TIME).

**Апсейл / кросс-сейл**
- «Найди клиентов, купивших товар X, и предложи товар Y» → `bx24_crm_products` + `bx24_crm_deals action=list` + `bx24_mail action=message_send`.

## Для РОПа

- «Сколько сделок закрыл Петров в этом месяце» → `bx24_crm_deals action=list` (ASSIGNED_BY_ID, STAGE_ID=CLOSED, >=BEGINDATE) + агрегация.
- «Конверсия из "Презентации" в "Договор"» → `bx24_reports action=deal_conversion`.
- «Покажи зависшие сделки (>14 дней без движения)» → `bx24_crm_deals action=list`.
- «Разошли уведомление всем ответственным о зависших сделках» → `bx24_im action=notify_personal_add` по списку (или `bx24_batch`).

## Для HR

- «Покажи всех сотрудников отдела маркетинга» → `bx24_departments action=list` → `bx24_users action=listByDepartment`.
- «Пригласи нового сотрудника Иванова, frontend, отдел IT» → `bx24_hr action=invite`.
- «Создай встречу 1:1 с руководителем» → `bx24_calendar action=event_add`.
- «Переведи Анну в отдел продаж» → `bx24_hr action=transfer`.

## Для администратора портала

- «Какие события подписаны (event.bind)» → `bx24_events action=get`.
- «Отпишись от onCrmLeadDelete» → `bx24_events action=unbind` (с подтверждением).
- «Покажи права/заметку по деструктивным действиям» → `audit.log` (см. [AUDIT_LOG](AUDIT_LOG.md)).
- «Сгенерируй отчёт по активности за неделю» → `bx24_reports action=user_activity`.

## Для маркетолога

- «Найди все лиды из VK» → `bx24_crm_leads action=list` (SOURCE_ID=VK).
- «Создай сегмент из лидов с просроченным платежом» → `bx24_marketing action=segment_create`.
- «Отправь письмо клиентам с просроченным платежом» → `bx24_mail action=message_send` (или `bx24_marketing action=broadcast_send`).
- «Покажи заявки с веб-форм за неделю» → `bx24_crm_webform action=result_list` (фильтр по дате).
- «Откуда пришёл лид #123? покажи UTM» → `bx24_crm_tracking action=trace_list` (фильтр по ENTITY_ID).

## Для проджект-менеджера

- «Поставь задачу отделу, дедлайн пятница» → `bx24_departments` + `bx24_users` + `bx24_tasks action=add` (AUDITORS=отдел).
- «Сколько задач в работе у Анны» → `bx24_tasks action=list` (RESPONSIBLE_ID, STATUS<>done) + `action=count`.
- «Создай проект "Альфа" с участниками» → `bx24_projects action=create` + `user_add`.
- «Переведи задачу #77 в стадию "На проверке"» → `bx24_tasks action=moveToStage`.
- «Добавь задачу #77 в поток "Срочные"» → `bx24_tasks action=addToFlow`.

## Для отделов продаж / документооборота

- «Сделай КП по сделке #456» → `bx24_crm_quotes action=add` → `productrows_set`.
- «Сгенерируй договор из шаблона №3 для компании #88» → `bx24_crm_documents action=document_add` (templateId, entityId, entityType).
- «Покажи шаблоны документов для сделок» → `bx24_crm_documents action=template_list`.
- «Настрой recurring-сделку — ежемесячное продление для #456» → `bx24_crm_deals action=recurring_add` (dealId + расписание).
- «Добавь валюту EUR, курс 100, сделай базовой» → `bx24_crm_currency action=add` → `base_set`.

## Для службы поддержки (открытые линии)

- «Покажи открытые линии и их статус» → `bx24_openlines action=config_list`.
- «Ответь на ждущий диалог на линии #2» → `bx24_openlines action=operator_answer`.
- «Создай лид CRM из этого диалога открытой линии» → `bx24_openlines action=crm_lead_create`.
- «Открой историю сессии для диалога #99» → `bx24_openlines action=session_history_get`.

## Для создателя чат-ботов

- «Зарегистрируй бота "Помощник"» → `bx24_bots action=bot_register`.
- «Добавь боту команду /faq» → `bx24_bots action=command_register`.
- «Бот отправляет приветственное сообщение в чат #5» → `bx24_bots action=message_send`.
- «Поставь реакцию 👍 на последнее сообщение» → `bx24_bots action=reaction_add`.

## Для склада / закупок

- «Добавь склад "Основной"» → `bx24_crm_products action=store_add`.
- «Создай приходный документ на +50 стульев и проведи его» → `bx24_crm_products action=document_add` → `document_conduct` (с подтверждением).
- «Покажи остатки по товару "Стул"» → `bx24_crm_products action=storeProduct_list` (фильтр по PRODUCT_ID).
- «Добавь тип цены "Оптовая"» → `bx24_crm_products action=priceType_add`.

## Готовые шаблоны-сниппеты

```
Создай лид: {{имя}}, телефон {{телефон}}, email {{email}}, источник {{источник}}.
Найди сделки в воронке "{{воронка}}" старше {{N}} дней и пришли список ответственным.
Поставь задачу "{{тема}}" ответственному {{ФИО}}, дедлайн {{дата}}, наблюдатели — отдел {{отдел}}.
Отправь в чат "{{чат}}" сообщение: {{текст}} и приложи файл {{файл}}.
Запусти бизнес-процесс "{{название}}" для сделки #{{id}}.
Сгенерируй документ "{{шаблон}}" для {{тип_сущности}} #{{id}} и верни публичную ссылку.
Сделай КП для сделки #{{id}} с товарами {{товары}} и отправь PDF клиенту.
Проведи {{тип_документа}} складской документ #{{id}} (подтверди).
Зарегистрируй бота "{{имя_бота}}" с командой /{{команда}}.
Преврати письмо #{{messageId}} в задачу для {{ФИО}}.
```

## Чек-лист внедрения

1. На портале создан вебхук или OAuth-приложение с нужными scope (crm, tasks, im, imopenlines, imbot, disk, calendar, user, catalog, lists, mail, telephony, bizproc, humanresources, timeman, event).
2. `BX24_CONFIRM_DESTRUCTIVE=true` на рабочих порталах.
3. `BX24_AUDIT_LOG` направлен в место, доступное только админам.
4. Пользователям раздали конфиги MCP-клиентов (см. README).
5. Провели демо-сценарии из [USER_GUIDE](USER_GUIDE.md).