import type { Dict } from "./ru.js";

// English UI/log strings. Must keep key parity with ru.ts.
export const en: Dict = {
  confirmRequired: "⚠️ Confirmation required.\n\nYou are about to perform a destructive action: \"{action}\" (tool \"{tool}\").\nThis may delete, remove, or modify data on the Bitrix24 portal.\n\nTo proceed, call this tool again with the same arguments AND add \"confirm\": true.\nIf this was not intended, do not proceed.",
  confirmPreview: "Confirm destructive action",
  unknownTool: "Unknown tool: {tool}",
  unknownAction: "Unknown action: {action}. Available: {actions}",
  paramRequired: "Parameter '{param}' is required for action '{action}'",
  validationFailed: "Validation failed",
  queryLimitExceeded: "Bitrix24 request rate limit exceeded, retry in {sec} sec",
  operationTimeLimit: "Operation time limit exceeded, waiting until reset",
  authFailed: "Bitrix24 authentication error",
  authNotConfigured: "Authentication not configured",
  authRefreshFailed: "Failed to refresh OAuth access token",
  requestTimeout: "Request timed out after {ms} ms",
  invalidMethod: "Invalid method name: {method}",
  batchEmpty: "'cmd' must contain at least one command",
  batchTooLarge: "A single batch supports at most 50 commands; split into multiple calls",
};