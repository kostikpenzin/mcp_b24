import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { AuditEntry } from "../types.js";

// Append-only JSONL audit logger for destructive operations and auth events.
// Path is taken from BX24_AUDIT_LOG. When unset, logging is disabled (no-op).
// Secrets are never written here — callers must mask sensitive params.
export class AuditLog {
  private enabled: boolean;
  private path?: string;

  constructor(path?: string) {
    this.path = path;
    this.enabled = !!path;
    if (this.enabled && this.path) {
      try {
        mkdirSync(dirname(this.path), { recursive: true });
      } catch {
        // best-effort; write will surface a real error if needed
      }
    }
  }

  write(entry: AuditEntry): void {
    if (!this.enabled || !this.path) return;
    try {
      appendFileSync(this.path, JSON.stringify(entry) + "\n", { encoding: "utf8" });
    } catch {
      // audit failures must never break the operation
    }
  }
}