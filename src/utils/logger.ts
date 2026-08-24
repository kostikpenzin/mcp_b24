import type { LogLevel } from "../types.js";

const RANK: Record<LogLevel, number> = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

// Minimal stderr logger that never prints secrets. Callers pass already-safe text.
export class Logger {
  constructor(private level: LogLevel) {}

  private ok(lvl: LogLevel): boolean {
    return RANK[this.level] >= RANK[lvl];
  }

  error(msg: unknown): void {
    if (this.ok("error")) console.error("[bx24][error]", msg);
  }
  warn(msg: unknown): void {
    if (this.ok("warn")) console.error("[bx24][warn]", msg);
  }
  info(msg: unknown): void {
    if (this.ok("info")) console.error("[bx24][info]", msg);
  }
  debug(msg: unknown): void {
    if (this.ok("debug")) console.error("[bx24][debug]", msg);
  }
}