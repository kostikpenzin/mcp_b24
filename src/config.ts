import type { Bitrix24Config, TransportKind, Lang, LogLevel } from "./types.js";
import {
  DEFAULT_OAUTH_SERVER,
  DEFAULT_MAX_ROWS,
  DEFAULT_HTTP_HOST,
  DEFAULT_HTTP_PORT,
  DEFAULT_HTTP_PATH,
  DEFAULT_RATE_LIMIT_RPS,
  DEFAULT_RATE_LIMIT_BURST,
  DEFAULT_LANG,
  DEFAULT_LOG_LEVEL,
} from "./constants.js";

function env(name: string): string | undefined {
  return process.env[name];
}

function requireEnv(name: string, ctx: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(
      `${ctx}: environment variable ${name} is required. Set BX24_WEBHOOK_URL (incoming webhook) or BX24_DOMAIN + BX24_CLIENT_ID + BX24_CLIENT_SECRET + BX24_REFRESH_TOKEN (OAuth application).`,
    );
  }
  return value;
}

function normalizeUrl(raw: string, label: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`Invalid ${label}: ${raw}. It must be a valid URL such as https://portal.bitrix24.ru`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Invalid ${label} protocol: ${url.protocol}. Only http: and https: are supported.`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} must not contain credentials. Use environment variables for authentication.`);
  }
  return url;
}

export function normalizeWebhookUrl(raw: string): string {
  const url = normalizeUrl(raw, "BX24_WEBHOOK_URL");
  const pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  return `${url.protocol}//${url.host}${pathname}`;
}

export function loadConfig(): Bitrix24Config {
  const mode = env("BX24_MODE");
  const webhookUrlRaw = env("BX24_WEBHOOK_URL");
  const domainRaw = env("BX24_DOMAIN");

  // Determine auth mode: explicit BX24_MODE wins; otherwise auto-detect.
  let authMode: Bitrix24Config["authMode"];
  if (mode === "webhook" || mode === "oauth") {
    authMode = mode;
  } else if (webhookUrlRaw) {
    authMode = "webhook";
  } else if (domainRaw) {
    authMode = "oauth";
  } else {
    throw new Error(
      "No Bitrix24 authentication configured. Set BX24_MODE=webhook + BX24_WEBHOOK_URL, or BX24_MODE=oauth + BX24_DOMAIN + BX24_CLIENT_ID + BX24_CLIENT_SECRET + BX24_REFRESH_TOKEN.",
    );
  }

  const confirmDestructive = env("BX24_CONFIRM_DESTRUCTIVE") === "true";
  const autoPaginate = env("BX24_AUTO_PAGINATE") === "true";
  const maxRows = parsePositiveInt(env("BX24_MAX_ROWS"), DEFAULT_MAX_ROWS, "BX24_MAX_ROWS");
  const rateLimitRps = parsePositiveInt(env("BX24_RATE_LIMIT_RPS"), DEFAULT_RATE_LIMIT_RPS, "BX24_RATE_LIMIT_RPS");
  const rateLimitBurst = parsePositiveInt(env("BX24_RATE_LIMIT_BURST"), DEFAULT_RATE_LIMIT_BURST, "BX24_RATE_LIMIT_BURST");
  const lang = parseLang(env("BX24_DEFAULT_LANG"));
  const logLevel = parseLogLevel(env("BX24_LOG_LEVEL"));
  const auditLogPath = env("BX24_AUDIT_LOG");

  const transport = parseTransport(env("BX24_TRANSPORT"), "stdio");
  const httpHost = env("BX24_HTTP_HOST") || DEFAULT_HTTP_HOST;
  const httpPort = parsePositiveInt(env("BX24_HTTP_PORT"), DEFAULT_HTTP_PORT, "BX24_HTTP_PORT");
  const httpPath = env("BX24_HTTP_PATH") || DEFAULT_HTTP_PATH;
  const oauthServer = env("BX24_OAUTH_SERVER") || DEFAULT_OAUTH_SERVER;

  let webhookUrl: string | undefined;
  let domain: string | undefined;
  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let refreshToken: string | undefined;
  let accessToken: string | undefined;

  if (authMode === "webhook") {
    if (!webhookUrlRaw) {
      throw new Error("Webhook mode requires BX24_WEBHOOK_URL (incoming webhook URL).");
    }
    webhookUrl = normalizeWebhookUrl(webhookUrlRaw);
    if (!/\/rest\/[^/]+\/[^/]+\/$/.test(webhookUrl)) {
      throw new Error(
        `BX24_WEBHOOK_URL must look like https://portal.bitrix24.ru/rest/<user_id>/<webhook_secret>/. Got: ${webhookUrl}`,
      );
    }
  } else {
    if (!domainRaw) {
      throw new Error("OAuth mode requires BX24_DOMAIN (portal domain, e.g. acme.bitrix24.ru).");
    }
    const d = normalizeUrl(`https://${domainRaw.replace(/^https?:\/\//, "")}`, "BX24_DOMAIN");
    domain = `${d.protocol}//${d.host}`;
    clientId = requireEnv("BX24_CLIENT_ID", "OAuth mode");
    clientSecret = requireEnv("BX24_CLIENT_SECRET", "OAuth mode");
    refreshToken = requireEnv("BX24_REFRESH_TOKEN", "OAuth mode");
    accessToken = env("BX24_ACCESS_TOKEN");
  }

  return {
    authMode,
    webhookUrl,
    domain,
    clientId,
    clientSecret,
    refreshToken,
    accessToken,
    oauthServer,
    confirmDestructive,
    autoPaginate,
    maxRows,
    rateLimitRps,
    rateLimitBurst,
    lang,
    logLevel,
    auditLogPath,
    transport,
    httpHost,
    httpPort,
    httpPath,
  };
}

function parseTransport(value: string | undefined, fallback: TransportKind): TransportKind {
  if (!value) return fallback;
  if (value === "stdio" || value === "http") return value;
  throw new Error(`Invalid BX24_TRANSPORT: ${value}. Allowed: stdio, http.`);
}

function parseLang(value: string | undefined): Lang {
  if (!value) return DEFAULT_LANG;
  if (value === "ru" || value === "en") return value;
  throw new Error(`Invalid BX24_DEFAULT_LANG: ${value}. Allowed: ru, en.`);
}

function parseLogLevel(value: string | undefined): LogLevel {
  if (!value) return DEFAULT_LOG_LEVEL;
  if (value === "silent" || value === "error" || value === "warn" || value === "info" || value === "debug") return value;
  throw new Error(`Invalid BX24_LOG_LEVEL: ${value}. Allowed: silent, error, warn, info, debug.`);
}

function parsePositiveInt(value: string | undefined, fallback: number, label: string): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
    throw new Error(`Invalid ${label}: ${value}. Must be a positive integer.`);
  }
  return n;
}