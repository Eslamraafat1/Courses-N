import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { WhyBento } from "./parts/WhyBento";

export async function WhyChooseUs({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  return (
    <section id="WhyChooseUs" data-section="WhyChooseUs" data-section-label={t("home2.why.label")} aria-labelledby="why-h">
      <WhyBento />
    </section>
  );
}
