import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const VERSION: string = pkg.version;

// Bitrix24 has two API generations. This server targets the classic stable
// REST methods (crm.*, tasks.task.*, im.*, disk.*, user.*, calendar.event.*).
export const API_VERSION = "REST 1.0 + 3.0";

// Default OAuth token endpoint for cloud Bitrix24 portals.
export const DEFAULT_OAUTH_SERVER = "https://oauth.bitrix.info";

export const DEFAULT_TIMEOUT_MS = 60000; // cloud Bitrix24 timeout is 60s
export const DEFAULT_MAX_ROWS = 5000;
export const DEFAULT_HTTP_HOST = "127.0.0.1";
export const DEFAULT_HTTP_PORT = 3000;
export const DEFAULT_HTTP_PATH = "/mcp";

// Rate-limit defaults (Bitrix24 leaky bucket): non-Enterprise 2 rps / burst 50;
// Enterprise 5 rps / burst 250. Default conservative.
export const DEFAULT_RATE_LIMIT_RPS = 2;
export const DEFAULT_RATE_LIMIT_BURST = 50;

// Backoff ceiling for QUERY_LIMIT_EXCEEDED retries (seconds).
export const MAX_BACKOFF_MS = 30000;
export const BACKOFF_STEPS_MS = [1000, 2000, 4000, 8000, 16000];

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";
export const DEFAULT_LOG_LEVEL: LogLevel = "info";
export type Lang = "ru" | "en";
export const DEFAULT_LANG: Lang = "ru";