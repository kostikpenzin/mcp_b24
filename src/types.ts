export type AuthMode = "webhook" | "oauth";
export type TransportKind = "stdio" | "http";
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type Lang = "ru" | "en";
export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface Bitrix24Config {
  authMode: AuthMode;
  webhookUrl?: string;
  domain?: string; // OAuth portal domain, e.g. acme.bitrix24.ru
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  oauthServer: string;
  confirmDestructive: boolean;
  autoPaginate: boolean;
  maxRows: number;
  rateLimitRps: number;
  rateLimitBurst: number;
  lang: Lang;
  logLevel: LogLevel;
  auditLogPath?: string;
  transport: TransportKind;
  httpHost: string;
  httpPort: number;
  httpPath: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

export interface ApiRequestOptions {
  restMethod: string;
  httpVerb?: HttpMethod;
  pathParams?: Record<string, string | number>;
  queryParams?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface Bitrix24Response {
  result?: unknown;
  next?: number;
  total?: number;
  error?: string;
  error_description?: string;
  error_information?: string;
  operating_reset_at?: number;
  [key: string]: unknown;
}

/** Structured confirmation preview returned for destructive actions (two-phase). */
export interface ConfirmContext {
  requiresConfirmation: boolean;
  description: string;
  preview?: Record<string, unknown>;
}

/** Audit log entry (JSONL). */
export interface AuditEntry {
  ts: string;
  tool: string;
  action: string;
  actor?: string;
  restMethod?: string;
  params?: Record<string, unknown>;
  result: "ok" | "error" | "denied";
  durationMs?: number;
  requestId?: string;
}