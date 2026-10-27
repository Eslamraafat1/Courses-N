import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getFaqs, getPlans } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { PricingView } from "@/components/pages/PricingView";

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/pricing", title: t("nav.pricing"), description: t("pricing.metaDesc") });
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [plans, faqs] = await Promise.all([getPlans(), getFaqs()]);
  return (
    <>
      <PageHeader eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} lead={t("pricing.lead")} crumbs={[{ label: t("nav.pricing") }]} />
      <PricingView plans={plans} faqs={faqs.filter((f) => f.group === "billing")} />
    </>
  );
}
