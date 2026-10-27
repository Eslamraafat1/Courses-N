import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourse, getCourses } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CurriculumList } from "@/components/courses/CurriculumList";
import { CourseViewTracker } from "@/components/courses/CourseViewTracker";
import { fmtMinutes, lessonsOf, totalMinutes } from "@/components/courses/format";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]/curriculum">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: `/courses/${slug}/curriculum`, title: `${t("course.tab.curriculum")} — ${course.title[lang]}`, description: course.subtitle[lang], image: course.thumbnail });
}

export default async function CurriculumPage({ params }: PageProps<"/[lang]/courses/[slug]/curriculum">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const course = await getCourse(slug);
  if (!course) notFound();
  const t = makeT(lang);
  const lessons = lessonsOf(course);

  return (
    <>
      <CourseViewTracker slug={slug} />
      <PageHeader
        eyebrow={course.title[lang]}
        title={t("course.tab.curriculum")}
        lead={t("course.curriculumSummary", { modules: course.modules.length, lessons: lessons.length, duration: fmtMinutes(t, totalMinutes(course.modules)) })}
        crumbs={[
          { label: t("nav.courses"), href: "/courses" },
          { label: course.title[lang], href: `/courses/${slug}` },
          { label: t("course.tab.curriculum") },
        ]}
        actions={<Button href={`/learn/${slug}`}>{t("act.startLearning")}</Button>}
      />
      <div className="container-x max-w-4xl py-10 sm:py-14">
        <CurriculumList courseSlug={slug} modules={course.modules} expandAll fallbackPoster={course.thumbnail} />
        <p className="mt-6 text-sm text-muted">{t("course.previewHint")}</p>
      </div>
    </>
  );
}
