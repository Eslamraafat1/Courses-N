import type { Lang } from "@/types";
import { common } from "./dict/common";
import { home } from "./dict/home";
import { home2 } from "./dict/home2";
import { home3 } from "./dict/home3";
import { courses } from "./dict/courses";
import { learn } from "./dict/learn";
import { account } from "./dict/account";
import { admin } from "./dict/admin";
import { pages } from "./dict/pages";

const all = [common, home, home2, home3, courses, learn, account, admin, pages] as const;

type Keys<T> = T extends { en: infer E } ? keyof E : never;
export type TKey = Keys<(typeof all)[number]>;
export type TFn = (key: TKey, vars?: Record<string, string | number>) => string;

const merged: Record<Lang, Record<string, string>> = { ar: {}, en: {} };
for (const d of all) {
  Object.assign(merged.en, d.en);
  Object.assign(merged.ar, d.ar);
}

export function makeT(lang: Lang): TFn {
  const table = merged[lang];
  return (key, vars) => {
    let s = table[key] ?? merged.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}
