import type {
  Bitrix24Config,
  Bitrix24Response,
  HttpMethod,
  AuditEntry,
} from "./types.js";
import { Bitrix24ApiError } from "./error.js";
import { VERSION, DEFAULT_TIMEOUT_MS, BACKOFF_STEPS_MS, MAX_BACKOFF_MS } from "./constants.js";
import { TokenBucket } from "./utils/tokenBucket.js";
import { Logger } from "./utils/logger.js";
import { AuditLog } from "./audit/log.js";
import { t } from "./i18n/index.js";

const USER_AGENT = `mcp-b24/${VERSION}`;

// Reasons indicating the access token is stale and (in OAuth mode) recoverable.
const EXPIRED_TOKEN_REASONS = new Set([
  "expired_token",
  "invalid_token",
  "invalid_request_token",
  "NO_AUTH_FOUND",
  "auth_error",
]);

export class Bitrix24ApiClient {
  private cachedAccessToken?: string;
  // For OAuth cloud portals the OAuth response provides `client_endpoint`,
  // which differs from the plain portal URL (e.g. https://oauth-acme.bitrix24.ru/rest/).
  private clientEndpoint?: string;
  private bucket: TokenBucket;
  private logger: Logger;
  private audit: AuditLog;

  constructor(private config: Bitrix24Config) {
    this.cachedAccessToken = config.accessToken;
    this.bucket = new TokenBucket(config.rateLimitBurst, config.rateLimitRps / 1000);
    this.logger = new Logger(config.logLevel);
    this.audit = new AuditLog(config.auditLogPath);
  }

  isConfirmDestructive(): boolean {
    return this.config.confirmDestructive;
  }

  lang(): Bitrix24Config["lang"] {
    return this.config.lang;
  }

  auditLog(): AuditLog {
    return this.audit;
  }

  loggerInstance(): Logger {
    return this.logger;
  }

  /** Call any Bitrix24 REST method by name (e.g. "crm.lead.list"). */
  async callMethod<T = Bitrix24Response>(
    restMethod: string,
    params?: Record<string, unknown>,
    opts?: { httpVerb?: HttpMethod; headers?: Record<string, string> },
  ): Promise<T> {
    return this.doCallMethod<T>(restMethod, params, opts, 0, false);
  }

  /** List method with optional auto-pagination. */
  async list<T = unknown>(
    restMethod: string,
    params: Record<string, unknown> = {},
    httpVerb: HttpMethod = "GET",
  ): Promise<{ rows: T[]; next?: number; total?: number }> {
    if (!this.config.autoPaginate) {
      const page = (await this.callMethod<Bitrix24Response>(restMethod, params, { httpVerb })) as Bitrix24Response;
      const rows = extractRows<T>(page.result);
      return { rows, next: page.next, total: page.total };
    }
    let start = typeof params.start === "number" ? params.start : 0;
    const collected: T[] = [];
    let total: number | undefined;
    for (;;) {
      const page = (await this.callMethod<Bitrix24Response>(restMethod, { ...params, start }, { httpVerb })) as Bitrix24Response;
      const rows = extractRows<T>(page.result);
      collected.push(...rows);
      total = page.total;
      const next = page.next;
      if (next === undefined || next === null) break;
      if (collected.length >= this.config.maxRows) break;
      start = next;
    }
    return { rows: collected.slice(0, this.config.maxRows), total };
  }

  private async doCallMethod<T>(
    restMethod: string,
    params: Record<string, unknown> | undefined,
    opts: { httpVerb?: HttpMethod; headers?: Record<string, string> } | undefined,
    backoffAttempt: number,
    isAuthRetry: boolean,
  ): Promise<T> {
    await this.bucket.acquire(1);

    const hasBody = params !== undefined && Object.keys(params).length > 0;
    const verb: HttpMethod = opts?.httpVerb ?? (hasBody ? "POST" : "GET");
    const url = this.buildUrl(restMethod, verb, params);

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      ...(opts?.headers || {}),
    };
    let bodyStr: string | undefined;
    if (verb === "POST" && hasBody) {
      headers["Content-Type"] = "application/json";
      bodyStr = JSON.stringify(params);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: verb,
        headers,
        body: bodyStr,
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
    } catch (err) {
      if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
        throw new Bitrix24ApiError(408, t(this.config.lang, "requestTimeout", { ms: DEFAULT_TIMEOUT_MS }), "REQUEST_TIMEOUT");
      }
      throw err;
    }

    const text = await response.text();
    let parsed: Bitrix24Response | undefined;
    try {
      parsed = text.length > 0 ? (JSON.parse(text) as Bitrix24Response) : undefined;
    } catch {
      // Non-JSON response (binary download handled by caller).
    }

    const errorReason = parsed?.error;
    const status = response.status;

    // Backoff on QUERY_LIMIT_EXCEEDED (503) — exponential, capped.
    if (status === 503 && (errorReason === "QUERY_LIMIT_EXCEEDED" || errorReason === "" || errorReason === undefined)) {
      if (backoffAttempt < BACKOFF_STEPS_MS.length) {
        const wait = Math.min(BACKOFF_STEPS_MS[backoffAttempt], MAX_BACKOFF_MS);
        this.logger.warn(t(this.config.lang, "queryLimitExceeded", { sec: Math.round(wait / 1000) }));
        await sleep(wait);
        return this.doCallMethod<T>(restMethod, params, opts, backoffAttempt + 1, isAuthRetry);
      }
    }

    // Pause on OPERATION_TIME_LIMIT (429) until operating_reset_at, then retry once.
    if (status === 429 || errorReason === "OPERATION_TIME_LIMIT") {
      if (backoffAttempt < BACKOFF_STEPS_MS.length) {
        const resetAt = parsed?.operating_reset_at;
        let wait = BACKOFF_STEPS_MS[backoffAttempt];
        if (typeof resetAt === "number" && resetAt > 0) {
          const secLeft = Math.max(resetAt - Math.floor(Date.now() / 1000), 1);
          wait = Math.min(secLeft * 1000, MAX_BACKOFF_MS);
        }
        this.logger.warn(t(this.config.lang, "operationTimeLimit"));
        await sleep(wait);
        return this.doCallMethod<T>(restMethod, params, opts, backoffAttempt + 1, isAuthRetry);
      }
    }

    const isAuthError =
      status === 401 || (errorReason !== undefined && EXPIRED_TOKEN_REASONS.has(errorReason));

    if (isAuthError && !isAuthRetry && this.canRefresh() && errorReason !== "invalid_client") {
      await this.refreshAccessToken();
      return this.doCallMethod<T>(restMethod, params, opts, backoffAttempt, true);
    }

    if (parsed && errorReason) {
      throw new Bitrix24ApiError(
        status,
        parsed.error_description || parsed.error_information || errorReason,
        errorReason,
        undefined,
      );
    }

    if (!response.ok) {
      throw new Bitrix24ApiError(status, text || `HTTP ${status}`, undefined, undefined);
    }

    if (parsed === undefined) {
      return text as unknown as T;
    }
    return parsed as unknown as T;
  }

  private buildUrl(restMethod: string, verb: HttpMethod, params: Record<string, unknown> | undefined): string {
    if (this.config.authMode === "webhook") {
      const base = `${this.config.webhookUrl}${restMethod}.json`;
      if (verb === "GET" && params) return `${base}?${this.buildQuery(params)}`;
      return base;
    }
    // OAuth: prefer client_endpoint from the OAuth response; fall back to portal domain.
    const restRoot = this.clientEndpoint ?? `${this.config.domain}/rest/`;
    const base = `${restRoot}${restMethod}.json`;
    const queryParts: string[] = [];
    if (this.cachedAccessToken) queryParts.push(`auth=${encodeURIComponent(this.cachedAccessToken)}`);
    if (verb === "GET" && params) {
      const qs = this.buildQuery(params);
      if (qs) queryParts.push(qs);
    }
    return queryParts.length > 0 ? `${base}?${queryParts.join("&")}` : base;
  }

  private buildQuery(params: Record<string, unknown>): string {
    const parts: string[] = [];
    const flatten = (prefix: string, value: unknown) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        for (const item of value) parts.push(`${encodeURIComponent(prefix)}[]=${encodeURIComponent(String(item))}`);
      } else if (value && typeof value === "object" && !(value instanceof Date)) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          flatten(prefix ? `${prefix}[${k}]` : k, v);
        }
      } else if (value instanceof Date) {
        parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(value.toISOString())}`);
      } else {
        parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
      }
    };
    for (const [k, v] of Object.entries(params)) flatten(k, v);
    return parts.join("&");
  }

  private canRefresh(): boolean {
    return (
      this.config.authMode === "oauth" &&
      !!this.config.clientId &&
      !!this.config.clientSecret &&
      !!this.config.refreshToken
    );
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.canRefresh()) {
      throw new Bitrix24ApiError(401, t(this.config.lang, "authNotConfigured"), "AUTH_NOT_CONFIGURED");
    }
    const url = `${this.config.oauthServer}/oauth/token/`;
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.config.clientId!,
      client_secret: this.config.clientSecret!,
      refresh_token: this.config.refreshToken!,
    });
    let data: {
      access_token?: string;
      refresh_token?: string;
      client_endpoint?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
      data = (await response.json().catch(() => ({}))) as typeof data;
    } catch (err) {
      this.audit.write({ ts: new Date().toISOString(), tool: "auth", action: "refresh", result: "error", restMethod: "oauth/token" });
      this.logger.error(err);
      throw new Bitrix24ApiError(401, t(this.config.lang, "authRefreshFailed"), "AUTH_REFRESH_FAILED");
    }
    if (!data.access_token) {
      this.audit.write({ ts: new Date().toISOString(), tool: "auth", action: "refresh", result: "error", restMethod: "oauth/token", params: { error: data.error } });
      throw new Bitrix24ApiError(
        401,
        `${t(this.config.lang, "authRefreshFailed")}: ${data.error_description || data.error || "no access_token"}`,
        data.error || "AUTH_REFRESH_FAILED",
      );
    }
    this.cachedAccessToken = data.access_token;
    if (data.refresh_token) this.config.refreshToken = data.refresh_token;
    if (data.client_endpoint) this.clientEndpoint = data.client_endpoint;
    this.audit.write({ ts: new Date().toISOString(), tool: "auth", action: "refresh", result: "ok", restMethod: "oauth/token" });
  }

  /** Emit a destructive-operation audit entry (called by framework). */
  recordDestructive(entry: Omit<AuditEntry, "ts">): void {
    this.audit.write({ ts: new Date().toISOString(), ...entry });
  }
}

function extractRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.list)) return obj.list as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
  }
  return [] as T[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}