import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { CatalogPage } from "@/components/courses/CatalogPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/new">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/courses/new", title: t("catalog.new.title"), description: t("catalog.new.lead") });
}

export default async function Page({ params }: PageProps<"/[lang]/courses/new">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <CatalogPage lang={lang} preset="new" />;
}
