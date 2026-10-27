import { ArrowUpRight } from "lucide-react";
import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCourseSummaries, getPaths } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "./parts/SectionHead";
import { PathsClient } from "./parts/PathsClient";

export async function LearningPaths({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [paths, all] = await Promise.all([getPaths(), getCourseSummaries()]);
  const needed = new Set(paths.flatMap((p) => p.stages.map((s) => s.courseSlug)));
  const courses = all.filter((c) => needed.has(c.slug));

  return (
    <section id="LearningPaths" data-section="LearningPaths" data-section-label={t("home.label.paths")} aria-labelledby="paths-title" className="relative overflow-x-clip bg-bg2/50 py-20 sm:py-28">
      <div className="container-x">
        <SectionHead
          id="paths-title"
          eyebrow={t("home.paths.eyebrow")}
          title={t("home.paths.title")}
          lead={t("home.paths.lead")}
          action={<Button href="/paths" variant="outline" iconEnd={<ArrowUpRight className="size-4 rtl-flip" aria-hidden />}>{t("act.viewAll")}</Button>}
        />
        <PathsClient paths={paths} courses={courses} />
      </div>
    </section>
  );
}
