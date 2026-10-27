import { ArrowUpRight } from "lucide-react";
import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCategories, getTrendingCourses } from "@/lib/api";
import { FloatingShapes } from "@/components/animations/Fx";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "./parts/SectionHead";
import { TrendingClient } from "./parts/TrendingClient";

export async function TrendingCourses({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [courses, categories] = await Promise.all([getTrendingCourses(), getCategories()]);
  const used = new Set(courses.map((c) => c.category.slug));
  const cats = categories.filter((c) => used.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name, color: c.color }));

  return (
    <section id="TrendingCourses" data-section="TrendingCourses" data-section-label={t("home.label.trending")} aria-labelledby="trending-title" className="relative isolate overflow-x-clip">
      <FloatingShapes />
      <div className="container-x py-20 sm:py-28">
      <SectionHead
        id="trending-title"
        eyebrow={t("home.trending.eyebrow")}
        title={t("home.trending.title")}
        lead={t("home.trending.lead")}
        action={<Button href="/courses/trending" variant="dark" iconEnd={<ArrowUpRight className="size-4 rtl-flip" aria-hidden />}>{t("act.viewAll")}</Button>}
      />
      <div className="mt-10">
        <TrendingClient courses={courses} cats={cats} />
      </div>
      </div>
    </section>
  );
}
