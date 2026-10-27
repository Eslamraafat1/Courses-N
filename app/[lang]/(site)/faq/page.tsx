import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getFaqs } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqView } from "@/components/pages/FaqView";
import { JsonLd } from "@/components/pages/JsonLd";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/faq", title: t("nav.faq"), description: t("faq.metaDesc") });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const faqs = await getFaqs();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q[lang], acceptedAnswer: { "@type": "Answer", text: f.a[lang] } })),
        }}
      />
      <PageHeader eyebrow={t("faq.eyebrow")} title={t("faq.title")} lead={t("faq.lead")} crumbs={[{ label: t("nav.faq") }]} />
      <FaqView faqs={faqs} />
    </>
  );
}
