import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCourses, getCourseSummaries } from "@/lib/api";
import { SectionHead } from "./parts/SectionHead";
import { ContinueClient, type ContinueCourse } from "./parts/ContinueClient";

export async function ContinueLearning({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [all, summaries] = await Promise.all([getCourses(), getCourseSummaries()]);
  // client decides which of these the learner has started (progress lives in localStorage)
  const courses: ContinueCourse[] = all.flatMap((c) => { const s = summaries.find((x) => x.slug === c.slug); return s ? [{ ...s, lessonIds: c.modules.flatMap((m) => m.lessons.map((x) => x.id)) }] : []; });

  return (
    <section id="ContinueLearning" data-section="ContinueLearning" data-section-label={t("home.label.continue")} aria-labelledby="continue-title" className="container-x py-20 sm:py-28">
      <SectionHead id="continue-title" eyebrow={t("home.continue.eyebrow")} title={t("home.continue.title")} lead={t("home.continue.lead")} />
      <div className="mt-10">
        <ContinueClient courses={courses} />
      </div>
    </section>
  );
}
