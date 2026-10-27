import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { termsSections } from "@/data/legal";
import { LegalDoc } from "@/components/pages/LegalDoc";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/terms", title: t("legal.terms.title"), description: t("legal.terms.metaDesc") });
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <LegalDoc lang={lang} kind="terms" sections={termsSections} />;
}
