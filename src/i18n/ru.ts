// Russian UI/log strings. Typed object so CI can check key parity with en.ts.
export const ru = {
  confirmRequired: "⚠️ Требуется подтверждение.\n\nВы собираетесь выполнить деструктивное действие: \"{action}\" (инструмент \"{tool}\").\nЭто может удалить, удалить или изменить данные на портале Битрикс24.\n\nЧтобы продолжить, вызовите инструмент снова с теми же аргументами и добавьте \"confirm\": true.\nЕсли это не intended — не продолжайте.",
  confirmPreview: "Подтвердите деструктивное действие",
  unknownTool: "Неизвестный инструмент: {tool}",
  unknownAction: "Неизвестное действие: {action}. Доступные: {actions}",
  paramRequired: "Параметр '{param}' обязателен для действия '{action}'",
  validationFailed: "Валидация не пройдена",
  queryLimitExceeded: "Превышен лимит запросов к Битрикс24, повтор через {sec} сек",
  operationTimeLimit: "Превышен временной лимит операции, ожидание до сброса",
  authFailed: "Ошибка авторизации Битрикс24",
  authNotConfigured: "Авторизация не настроена",
  authRefreshFailed: "Не удалось обновить access-токен OAuth",
  requestTimeout: "Запрос превысил таймаут {ms} мс",
  invalidMethod: "Недопустимое имя метода: {method}",
  batchEmpty: "cmd должен содержать хотя бы одну команду",
  batchTooLarge: "Один batch поддерживает не более 50 команд; разделите на несколько вызовов",
};

export type Dict = Record<keyof typeof ru, string>;