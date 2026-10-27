import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { CatalogPage } from "@/components/courses/CatalogPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/trending">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/courses/trending", title: t("catalog.trending.title"), description: t("catalog.trending.lead") });
}

export default async function Page({ params }: PageProps<"/[lang]/courses/trending">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <CatalogPage lang={lang} preset="trending" />;
}
