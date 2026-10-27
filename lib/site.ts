import type { Metadata } from "next";
import type { Lang } from "@/types";
import { LOCALES } from "@/lib/i18n/config";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = { ar: "نيكسورا أكاديمي", en: "NEXORA ACADEMY" } as const;
export const SITE_DESC = {
  ar: "منصة تعلّم سينمائية: كورسات برمجة وتصميم وذكاء اصطناعي ومسارات تعلم تفاعلية. (نسخة تجريبية)",
  en: "A cinematic learning platform: programming, design and AI courses with interactive learning paths. (Demo)",
} as const;

/** Build page metadata with canonical + hreflang alternates + Open Graph, localised. */
export function pageMeta(opts: { lang: Lang; path: string; title: string; description?: string; image?: string; type?: "website" | "article" }): Metadata {
  const { lang, path, title, description = SITE_DESC[lang], image, type = "website" } = opts;
  const suffix = path === "/" ? "" : path;
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}${suffix}`]));
  return {
    title,
    description,
    alternates: { canonical: `/${lang}${suffix}`, languages },
    openGraph: {
      type,
      title,
      description,
      url: `/${lang}${suffix}`,
      siteName: SITE_NAME[lang],
      locale: lang === "ar" ? "ar_AR" : "en_US",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
