import type { Lang } from "../types.js";
import { ru, type Dict } from "./ru.js";
import { en } from "./en.js";

const DICTS: Record<Lang, Dict> = { ru, en };

export function t(lang: Lang, key: keyof Dict, vars?: Record<string, string | number>): string {
  const dict = DICTS[lang] ?? ru;
  let s = dict[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export type { Dict } from "./ru.js";