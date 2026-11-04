import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { homeSections } from "@/data/home";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta, SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/pages/JsonLd";
import { sectionRegistry } from "@/components/sections/registry";
import { SectionIndicator } from "@/components/layout/ScrollUI";
import { BackgroundTint } from "@/components/layout/BackgroundTint";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const meta = pageMeta({ lang, path: "/", title: `${SITE_NAME[lang]} — ${makeT(lang)("brand.tagline")}` });
  // `absolute` skips the layout's "%s · NEXORA ACADEMY" template, which would repeat the brand name on the home page.
  return { ...meta, title: { absolute: meta.title as string } };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const home = `${SITE_URL}/${lang}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME.en,
        alternateName: SITE_NAME.ar,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        description: SITE_DESC[lang],
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: SITE_NAME[lang],
        url: home,
        inLanguage: lang,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${home}/courses?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      {homeSections
        .filter((s) => s.enabled)
        .map(({ id }) => {
          const Section = sectionRegistry[id];
          // One Suspense boundary per section: React hydrates them as separate, yielding tasks instead of one long block.
          return (
            <Suspense key={id} fallback={null}>
              <Section lang={lang} />
            </Suspense>
          );
        })}
      <SectionIndicator />
      <BackgroundTint />
    </>
  );
}
