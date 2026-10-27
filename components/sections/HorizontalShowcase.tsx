import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCourseSummaries } from "@/lib/api";
import { SectionHead } from "./parts/SectionHead";
import { HorizontalClient } from "./parts/HorizontalClient";

export async function HorizontalShowcase({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const all = await getCourseSummaries();
  // a different cut than Trending/Stacked: highest-rated, newest first on ties
  const courses = [...all].sort((a, b) => b.rating - a.rating || b.publishedAt.localeCompare(a.publishedAt)).slice(0, 6);

  return (
    <section id="HorizontalShowcase" data-section="HorizontalShowcase" data-section-label={t("home.label.stories")} aria-labelledby="hs-title">
      <HorizontalClient
        courses={courses}
        head={<SectionHead id="hs-title" eyebrow={t("home.hs.eyebrow")} title={t("home.hs.title")} lead={t("home.hs.lead")} />}
      />
    </section>
  );
}
