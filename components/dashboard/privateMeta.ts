import type { Metadata } from "next";
import { isLang } from "@/lib/i18n/config";
import { makeT, type TKey } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";

/** Metadata for private / UI-only pages (auth, account): localised title and `noindex`. */
export async function privateMeta(params: Promise<{ lang: string }>, path: string, titleKey: TKey, descKey?: TKey): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return {
    ...pageMeta({ lang, path, title: t(titleKey), description: descKey ? t(descKey) : undefined }),
    robots: { index: false, follow: false },
  };
}
