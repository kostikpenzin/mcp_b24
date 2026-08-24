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

## Для проджект-менеджера

- «Поставь задачу отделу, дедлайн пятница» → `bx24_departments` + `bx24_users` + `bx24_tasks action=add` (AUDITORS=отдел).
- «Сколько задач в работе у Анны» → `bx24_tasks action=list` (RESPONSIBLE_ID, STATUS<>done) + `action=count`.
- «Создай проект "Альфа" с участниками» → `bx24_projects action=create` + `user_add`.

## Готовые шаблоны-сниппеты

```
Создай лид: {{имя}}, телефон {{телефон}}, email {{email}}, источник {{источник}}.
Найди сделки в воронке "{{воронка}}" старше {{N}} дней и пришли список ответственным.
Поставь задачу "{{тема}}" ответственному {{ФИО}}, дедлайн {{дата}}, наблюдатели — отдел {{отдел}}.
Отправь в чат "{{чат}}" сообщение: {{текст}} и приложи файл {{файл}}.
Запусти бизнес-процесс "{{название}}" для сделки #{{id}}.
```

## Чек-лист внедрения

1. На портале создан вебхук или OAuth-приложение с нужными scope (crm, tasks, im, disk, calendar, user, catalog, lists, mail, telephony, bizproc, humanresources, timeman, event).
2. `BX24_CONFIRM_DESTRUCTIVE=true` на рабочих порталах.
3. `BX24_AUDIT_LOG` направлен в место, доступное только админам.
4. Пользователям раздали конфиги MCP-клиентов (см. README).
5. Провели демо-сценарии из [USER_GUIDE](USER_GUIDE.md).