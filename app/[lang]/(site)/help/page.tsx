import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { HelpView } from "@/components/pages/HelpView";

export async function generateMetadata({ params }: PageProps<"/[lang]/help">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/help", title: t("nav.help"), description: t("help.metaDesc") });
}

export default async function HelpPage({ params }: PageProps<"/[lang]/help">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  return (
    <>
      <PageHeader eyebrow={t("help.eyebrow")} title={t("help.title")} lead={t("help.lead")} crumbs={[{ label: t("nav.help") }]} />
      <HelpView />
    </>
  );
}
