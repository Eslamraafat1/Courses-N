"use client";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { L, Lang } from "@/types";
import { dirOf, href as hrefFn, nf } from "@/lib/i18n/config";
import { makeT, type TFn } from "@/lib/i18n";

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  isRtl: boolean;
  t: TFn;
  /** pick the active language from a bilingual value */
  l: (v: L) => string;
  /** locale-prefixed href */
  h: (path: string) => string;
  /** format a number with latin digits */
  n: (v: number) => string;
}

const Ctx = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = useMemo(() => makeT(lang), [lang]);
  const l = useCallback((v: L) => v[lang], [lang]);
  const h = useCallback((p: string) => hrefFn(p, lang), [lang]);
  const n = useCallback((v: number) => nf(lang).format(v), [lang]);
  const value = useMemo<I18nValue>(
    () => ({ lang, dir: dirOf(lang), isRtl: lang === "ar", t, l, h, n }),
    [lang, t, l, h, n],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}
