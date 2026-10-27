import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getFeaturedCourses, getTrendingCourses } from "@/lib/api";
import { SectionHead } from "./parts/SectionHead";
import { StackedClient } from "./parts/StackedClient";

export async function StackedShowcase({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [featured, trending] = await Promise.all([getFeaturedCourses(), getTrendingCourses()]);
  const seen = new Set<string>();
  const courses = [...featured, ...trending].filter((c) => (seen.has(c.slug) ? false : (seen.add(c.slug), true))).slice(0, 4);

  return (
    <section id="StackedShowcase" data-section="StackedShowcase" data-section-label={t("home.label.stacked")} aria-labelledby="stacked-title">
      <StackedClient
        courses={courses}
        head={<SectionHead id="stacked-title" eyebrow={t("home.stacked.eyebrow")} title={t("home.stacked.title")} lead={t("home.stacked.lead")} />}
      />
    </section>
  );
}
