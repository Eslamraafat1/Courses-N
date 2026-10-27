import type { L, Lang } from "@/types";

export const LOCALES: readonly Lang[] = ["ar", "en"] as const;
export const DEFAULT_LANG: Lang = "ar";

export const isLang = (v: string): v is Lang => (LOCALES as readonly string[]).includes(v);
export const dirOf = (lang: Lang): "rtl" | "ltr" => (lang === "ar" ? "rtl" : "ltr");

/** Pick the right side of a bilingual value. */
export const tr = (l: L, lang: Lang): string => l[lang];

/** Prefix an app path with the locale. `href("/courses", "ar")` -> `/ar/courses` */
export function href(path: string, lang: Lang): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Swap the locale segment of a pathname. */
export function switchLangPath(pathname: string, to: Lang): string {
  const parts = pathname.split("/");
  if (parts[1] && isLang(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

/** Intl number / date helpers (latin digits for both languages to keep stats unambiguous). */
export const nf = (lang: Lang) => new Intl.NumberFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US");
export const formatDate = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
