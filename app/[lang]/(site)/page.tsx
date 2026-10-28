import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { homeSections } from "@/data/home";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta, SITE_NAME } from "@/lib/site";
import { sectionRegistry } from "@/components/sections/registry";
import { SectionIndicator } from "@/components/layout/ScrollUI";
import { BackgroundTint } from "@/components/layout/BackgroundTint";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return pageMeta({ lang, path: "/", title: `${SITE_NAME[lang]} — ${makeT(lang)("brand.tagline")}` });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
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
