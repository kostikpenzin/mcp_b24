import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, normalizeWebhookUrl } from "./config.js";

const ENV = { ...process.env };

function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe("normalizeWebhookUrl", () => {
  it("appends trailing slash", () => {
    expect(normalizeWebhookUrl("https://portal.bitrix24.ru/rest/1/abcd")).toBe(
      "https://portal.bitrix24.ru/rest/1/abcd/",
    );
  });

  it("keeps single trailing slash", () => {
    expect(normalizeWebhookUrl("https://portal.bitrix24.ru/rest/1/abcd/")).toBe(
      "https://portal.bitrix24.ru/rest/1/abcd/",
    );
  });

  it("rejects invalid URLs", () => {
    expect(() => normalizeWebhookUrl("not-a-url")).toThrow();
  });
});

describe("loadConfig webhook mode", () => {
  beforeEach(() => { process.env = { ...ENV }; delete process.env.BX24_WEBHOOK_URL; delete process.env.BX24_DOMAIN; delete process.env.BX24_MODE; });
  afterEach(() => { process.env = { ...ENV }; });

  it("auto-detects webhook mode with defaults", () => {
    setEnv({ BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret" });
    const cfg = loadConfig();
    expect(cfg.authMode).toBe("webhook");
    expect(cfg.webhookUrl).toBe("https://portal.bitrix24.ru/rest/1/secret/");
    expect(cfg.confirmDestructive).toBe(false);
    expect(cfg.autoPaginate).toBe(false);
    expect(cfg.maxRows).toBe(5000);
    expect(cfg.rateLimitRps).toBe(2);
    expect(cfg.rateLimitBurst).toBe(50);
    expect(cfg.lang).toBe("ru");
    expect(cfg.logLevel).toBe("info");
    expect(cfg.transport).toBe("stdio");
    expect(cfg.httpPath).toBe("/mcp");
    expect(cfg.corsOrigin).toBe("");
    expect(cfg.httpToken).toBeUndefined();
  });

  it("honours explicit BX24_MODE=webhook and flags", () => {
    setEnv({
      BX24_MODE: "webhook",
      BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret",
      BX24_CONFIRM_DESTRUCTIVE: "true",
      BX24_AUTO_PAGINATE: "true",
      BX24_DEFAULT_LANG: "en",
      BX24_LOG_LEVEL: "warn",
      BX24_RATE_LIMIT_RPS: "5",
      BX24_AUDIT_LOG: "/tmp/audit.log",
    });
    const cfg = loadConfig();
    expect(cfg.authMode).toBe("webhook");
    expect(cfg.confirmDestructive).toBe(true);
    expect(cfg.autoPaginate).toBe(true);
    expect(cfg.lang).toBe("en");
    expect(cfg.logLevel).toBe("warn");
    expect(cfg.rateLimitRps).toBe(5);
    expect(cfg.auditLogPath).toBe("/tmp/audit.log");
  });

  it("honours BX24_CORS_ORIGIN", () => {
    setEnv({
      BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret",
      BX24_CORS_ORIGIN: "https://app.example.com",
    });
    expect(loadConfig().corsOrigin).toBe("https://app.example.com");
  });

  it("honours BX24_HTTP_TOKEN", () => {
    setEnv({
      BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret",
      BX24_HTTP_TOKEN: "topsecret",
    });
    expect(loadConfig().httpToken).toBe("topsecret");
  });

  it("rejects webhook URL not matching the REST path pattern", () => {
    setEnv({ BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/" });
    expect(() => loadConfig()).toThrow(/rest\/<user_id>/);
  });
});

describe("loadConfig oauth mode", () => {
  beforeEach(() => { process.env = { ...ENV }; delete process.env.BX24_WEBHOOK_URL; delete process.env.BX24_DOMAIN; delete process.env.BX24_MODE; });
  afterEach(() => { process.env = { ...ENV }; });

  it("loads oauth mode when domain + client credentials provided", () => {
    setEnv({
      BX24_MODE: "oauth",
      BX24_DOMAIN: "portal.bitrix24.ru",
      BX24_CLIENT_ID: "id",
      BX24_CLIENT_SECRET: "secret",
      BX24_REFRESH_TOKEN: "refresh",
      BX24_ACCESS_TOKEN: "access",
    });
    const cfg = loadConfig();
    expect(cfg.authMode).toBe("oauth");
    expect(cfg.domain).toBe("https://portal.bitrix24.ru");
    expect(cfg.clientId).toBe("id");
    expect(cfg.refreshToken).toBe("refresh");
    expect(cfg.accessToken).toBe("access");
    expect(cfg.oauthServer).toBe("https://oauth.bitrix.info");
  });

  it("requires client credentials in oauth mode", () => {
    setEnv({ BX24_MODE: "oauth", BX24_DOMAIN: "portal.bitrix24.ru" });
    expect(() => loadConfig()).toThrow(/BX24_CLIENT_ID/);
  });

  it("requires BX24_DOMAIN in oauth mode", () => {
    setEnv({ BX24_MODE: "oauth", BX24_CLIENT_ID: "id", BX24_CLIENT_SECRET: "s", BX24_REFRESH_TOKEN: "r" });
    expect(() => loadConfig()).toThrow(/BX24_DOMAIN/);
  });

  it("prefers webhook when both webhook and domain are set", () => {
    setEnv({
      BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret",
      BX24_DOMAIN: "portal.bitrix24.ru",
    });
    expect(loadConfig().authMode).toBe("webhook");
  });
});

describe("loadConfig errors", () => {
  beforeEach(() => { process.env = { ...ENV }; delete process.env.BX24_WEBHOOK_URL; delete process.env.BX24_DOMAIN; delete process.env.BX24_MODE; });
  afterEach(() => { process.env = { ...ENV }; });

  it("errors when nothing is configured", () => {
    expect(() => loadConfig()).toThrow(/No Bitrix24 authentication/);
  });

  it("rejects invalid transport", () => {
    setEnv({ BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret", BX24_TRANSPORT: "ws" });
    expect(() => loadConfig()).toThrow(/BX24_TRANSPORT/);
  });

  it("rejects invalid lang", () => {
    setEnv({ BX24_WEBHOOK_URL: "https://portal.bitrix24.ru/rest/1/secret", BX24_DEFAULT_LANG: "de" });
    expect(() => loadConfig()).toThrow(/BX24_DEFAULT_LANG/);
  });
});