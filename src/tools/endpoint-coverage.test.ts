import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getAllTools, NON_ACTION_TOOLS } from "./index.js";
import { Bitrix24ApiClient } from "../api-client.js";
import type { Bitrix24Config } from "../types.js";

const cfg: Bitrix24Config = {
  authMode: "webhook",
  webhookUrl: "https://portal.bitrix24.ru/rest/1/secret/",
  oauthServer: "https://oauth.bitrix.info",
  confirmDestructive: false,
  autoPaginate: false,
  maxRows: 5000,
  rateLimitRps: 100,
  rateLimitBurst: 100,
  lang: "ru",
  logLevel: "silent",
  transport: "stdio",
  httpHost: "127.0.0.1",
  httpPort: 3000,
  httpPath: "/mcp",
};

// Custom-handler tools (not built via createActionTool) — mappings are inline, so we
// hardcode their action → restMethod expectations here.
const CUSTOM_EXPECTED: Record<string, Record<string, string>> = {
  bx24_crm_invoices: {
    add: "crm.item.add", get: "crm.item.get", list: "crm.item.list", update: "crm.item.update",
    delete: "crm.item.delete", fields: "crm.item.fields", stage_list: "crm.status.list",
    getProductRows: "crm.item.productrow.list", setProductRows: "crm.item.productrow.set",
    addProductRow: "crm.item.productrow.add",
  },
  bx24_smart_processes: {
    type_list: "crm.type.list", type_get: "crm.type.get", type_add: "crm.type.add",
    type_update: "crm.type.update", type_delete: "crm.type.delete",
    item_list: "crm.item.list", item_get: "crm.item.get", item_add: "crm.item.add",
    item_update: "crm.item.update", item_delete: "crm.item.delete",
  },
};

interface Mapping { tool: string; action: string; restMethod: string; pathParams: string[]; bodyParam?: string; }

// Parse source files to extract action → restMethod mappings for framework (createActionTool) tools.
function parseMappings(): Mapping[] {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "tools");
  const out: Mapping[] = [];
  function scan(dir: string) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) { scan(p); continue; }
      if (!f.name.endsWith(".ts") || f.name.endsWith(".test.ts")) continue;
      const c = readFileSync(p, "utf8");
      const nm = c.match(/createActionTool\(\s*"(bx24_[^"]+)"/);
      if (!nm) continue;
      const tool = nm[1];
      // 6-space-indented mapping entries: "key: { ... restMethod: "m" ... }"
      const re = /^      ([a-zA-Z_]\w*):\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\},?$/gm;
      let m: RegExpExecArray | null;
      while ((m = re.exec(c)) !== null) {
        const action = m[1], body = m[2];
        const rm = body.match(/restMethod:\s*"([^"]+)"/);
        if (!rm) continue; // paramSchema entry (no restMethod) — skip
        const pp = body.match(/pathParams:\s*\[([^\]]*)\]/);
        const bp = body.match(/bodyParam:\s*"([^"]+)"/);
        out.push({
          tool, action, restMethod: rm[1],
          pathParams: pp ? pp[1].split(",").map(s => s.trim().replace(/"/g, "")).filter(Boolean) : [],
          bodyParam: bp ? bp[1] : undefined,
        });
      }
    }
  }
  scan(root);
  return out;
}

const DUMMY = "1";

// Enum-constrained params need a valid value; pick the first allowed enum value.
const ENUM_OVERRIDES: Record<string, unknown> = {
  type: "user", calendarType: "user", MUTE_ACTION: "mute", MANAGER_ACTION: "set",
  ownerType: "lead", entity: "lead", calendarType2: "user",
};

function dummyForType(propSchema: unknown): unknown {
  if (typeof propSchema !== "object" || propSchema === null) return "1";
  const ps = propSchema as { type?: string; items?: { type?: string }; enum?: unknown[] };
  switch (ps.type) {
    case "integer": return 1;
    case "object": return {};
    case "array":
      // array-of-objects (e.g. rows, fileArray) → [{}]; array-of-strings → ["1"]
      return ps.items?.type === "object" ? [{}] : ["1"];
    case "boolean": return true;
    default: return "1"; // string and unknown
  }
}

function buildDummyFor(propName: string, propSchema: unknown): unknown {
  if (propName in ENUM_OVERRIDES) return ENUM_OVERRIDES[propName];
  if (typeof propSchema !== "object" || propSchema === null) return DUMMY;
  // enum on the property itself
  const ps = propSchema as { enum?: unknown[] };
  if (Array.isArray(ps.enum) && ps.enum.length > 0) return ps.enum[0];
  return dummyForType(propSchema);
}

function buildArgs(mapping: Mapping, tool: { inputSchema: { properties: Record<string, unknown> } }): Record<string, unknown> {
  const props = tool.inputSchema.properties;
  const args: Record<string, unknown> = { action: mapping.action, confirm: true };
  for (const p of mapping.pathParams) args[p] = buildDummyFor(p, props[p]);
  if (mapping.bodyParam) args[mapping.bodyParam] = buildDummyFor(mapping.bodyParam, props[mapping.bodyParam]);
  return args;
}

// Custom-handler tools need their own dummy args (their param names differ).
function buildCustomArgs(tool: string, action: string): Record<string, unknown> {
  const args: Record<string, unknown> = { action, confirm: true };
  if (tool === "bx24_crm_invoices") {
    if (["get", "update", "delete", "setProductRows", "addProductRow", "getProductRows"].includes(action)) args.id = DUMMY;
    if (["add", "update"].includes(action)) args.fields = {};
    if (action === "setProductRows") args.rows = [{}];
    if (action === "addProductRow") args.row = {};
  } else if (tool === "bx24_smart_processes") {
    if (action.startsWith("type_") || action.startsWith("item_")) args.typeId = DUMMY;
    if (["item_get", "item_update", "item_delete"].includes(action)) args.id = DUMMY;
    if (action === "type_add" || action === "type_update") args.typeFields = {};
    if (["item_add", "item_update"].includes(action)) args.fields = {};
  }
  return args;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("Endpoint coverage — every action routes to its expected REST method", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ result: "ok" })));
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => vi.restoreAllMocks());

  const client = new Bitrix24ApiClient(cfg);
  const tools = getAllTools(client);
  const byName = new Map(tools.map((t) => [t.name, t]));
  const parsed = parseMappings();

  // Build the full case list: framework tools (parsed) + custom-handler tools (hardcoded).
  const cases: { tool: string; action: string; expected: string }[] = [];
  for (const m of parsed) cases.push({ tool: m.tool, action: m.action, expected: m.restMethod });
  for (const [tool, acts] of Object.entries(CUSTOM_EXPECTED)) {
    for (const [action, expected] of Object.entries(acts)) cases.push({ tool, action, expected });
  }

  it(`covers all ${cases.length} action→endpoint mappings`, async () => {
    const failures: string[] = [];
    const noFetch: string[] = [];
    let tested = 0;

    for (const c of cases) {
      const tool = byName.get(c.tool);
      if (!tool) { failures.push(`${c.tool}: tool not registered`); continue; }
      fetchMock.mockClear();

      const isCustom = c.tool in CUSTOM_EXPECTED;
      const args = isCustom
        ? buildCustomArgs(c.tool, c.action)
        : buildArgs(parsed.find((m) => m.tool === c.tool && m.action === c.action)!, tool);
      const res = await tool.handler(args);
      const txt = res.content.map((x) => x.text).join("\n");

      if (fetchMock.mock.calls.length === 0) {
        // No fetch → handler returned an error before calling (e.g. paramRequired). This is a gap.
        noFetch.push(`${c.tool}.${c.action} → ${c.expected} (handler did not reach fetch: ${txt.slice(0, 60)})`);
        continue;
      }
      const url = fetchMock.mock.calls[0][0] as string;
      if (!url.includes(`/${c.expected}.json`)) {
        failures.push(`${c.tool}.${c.action}: expected ${c.expected}, got URL ${url}`);
      }
      tested++;
    }

    const report = [
      `Tested: ${tested}/${cases.length}`,
      `Wrong method: ${failures.length}`,
      `Did not reach fetch (param gap): ${noFetch.length}`,
    ];
    if (failures.length) report.push("--- WRONG METHOD ---", ...failures);
    if (noFetch.length) report.push("--- NO FETCH (need more dummy params) ---", ...noFetch);
    // Assert: no wrong-method routing, and every endpoint reached fetch.
    expect(failures, report.join("\n")).toEqual([]);
    expect(noFetch.length, report.join("\n")).toBe(0);
  });

  it("no action-tool is left without a single routing case", () => {
    const testedTools = new Set(cases.map((c) => c.tool));
    const untested = tools.map((t) => t.name).filter((n) => !testedTools.has(n) && !NON_ACTION_TOOLS.has(n));
    expect(untested, `Action-tools with zero endpoint cases: ${untested.join(", ")}`).toEqual([]);
  });
});