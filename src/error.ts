import type { ToolResult } from "./types.js";

export class Bitrix24ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public reason?: string,
    public type?: string,
  ) {
    super(message);
    this.name = "Bitrix24ApiError";
  }
}

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
  };
}

export function apiErrorResult(err: Bitrix24ApiError): ToolResult {
  const parts = [`Bitrix24 API Error ${err.status}: ${err.message}`];
  if (err.reason) parts.push(`Reason: ${err.reason}`);
  if (err.type) parts.push(`Type: ${err.type}`);
  return {
    content: [{ type: "text", text: parts.join("\n") }],
    isError: true,
  };
}

export function successResult(data: unknown): ToolResult {
  const text =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [{ type: "text", text }],
  };
}