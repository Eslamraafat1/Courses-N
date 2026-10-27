import { getCourseSummaries, getInstructors } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import type { Lang } from "@/types";
import { InstructorShowcase, type InstructorEntry } from "./parts/InstructorShowcase";

export async function InstructorSpotlight({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [instructors, courses] = await Promise.all([getInstructors(), getCourseSummaries()]);
  const entries: InstructorEntry[] = instructors.map((instructor) => ({
    instructor,
    courses: courses.filter((c) => c.instructor.slug === instructor.slug).map((c) => ({ slug: c.slug, title: c.title })),
  }));
  return (
    <section id="InstructorSpotlight" data-section="InstructorSpotlight" data-section-label={t("home2.ins.label")} aria-labelledby="ins-h" className="relative isolate overflow-x-clip bg-bg2/50">
      <InstructorShowcase entries={entries} />
    </section>
  );
}
