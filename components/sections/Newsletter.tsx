import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { NewsletterForm } from "./parts/NewsletterForm";

export async function Newsletter({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  return (
    <section id="Newsletter" data-section="Newsletter" data-section-label={t("home2.news.label")} aria-labelledby="news-h" className="relative isolate overflow-x-clip">
      <NewsletterForm />
    </section>
  );
}
