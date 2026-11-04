import type { Metadata } from "next";
import type { Lang } from "@/types";
import { DEFAULT_LANG, LOCALES } from "@/lib/i18n/config";

/** Production origin, used whenever no env var is set (e.g. a Vercel deploy without NEXT_PUBLIC_SITE_URL). */
export const PRODUCTION_URL = "https://courses-n.vercel.app";

/**
 * Absolute origin used for canonical URLs, hreflang, sitemap, robots and JSON-LD.
 * Order: explicit NEXT_PUBLIC_SITE_URL → Vercel's production domain → hard-coded production URL.
 * It never falls back to localhost, so a missing env var cannot leak `http://localhost:3000` into production HTML.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  PRODUCTION_URL
).replace(/\/+$/, "");
export const SITE_NAME = { ar: "نيكسورا أكاديمي", en: "NEXORA ACADEMY" } as const;
export const SITE_DESC = {
  ar: "منصة تعلّم سينمائية: كورسات برمجة وتصميم وذكاء اصطناعي ومسارات تعلم تفاعلية. (نسخة تجريبية)",
  en: "A cinematic learning platform: programming, design and AI courses with interactive learning paths. (Demo)",
} as const;

/** Build page metadata with canonical + hreflang alternates + Open Graph, localised. */
export function pageMeta(opts: { lang: Lang; path: string; title: string; description?: string; image?: string; type?: "website" | "article" }): Metadata {
  const { lang, path, title, description = SITE_DESC[lang], image, type = "website" } = opts;
  const suffix = path === "/" ? "" : path;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `/${l}${suffix}`]));
  languages["x-default"] = `/${DEFAULT_LANG}${suffix}`;
  const ogImage = image ?? `/${lang}/opengraph-image`;
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
      images: [{ url: ogImage, ...(image ? {} : { width: 1200, height: 630, alt: SITE_NAME[lang] }) }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

/** schema.org BreadcrumbList with absolute URLs. `items` excludes Home, which is added first. */
export function breadcrumbJsonLd(lang: Lang, items: { name: string; path: string }[], homeName: string) {
  const all = [{ name: homeName, path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}/${lang}${it.path === "/" ? "" : it.path}`,
    })),
  };
}
