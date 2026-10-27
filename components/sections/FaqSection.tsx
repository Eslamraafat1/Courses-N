import { getFaqs } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { FaqExplorer } from "./parts/FaqExplorer";

export async function FaqSection({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const faqs = await getFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q[lang],
      acceptedAnswer: { "@type": "Answer", text: f.a[lang] },
    })),
  };
  return (
    <section id="FaqSection" data-section="FaqSection" data-section-label={t("home2.faq.label")} aria-labelledby="faq-h" className="bg-bg2/50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FaqExplorer faqs={faqs} />
    </section>
  );
}
