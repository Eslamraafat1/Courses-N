import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourses, getLesson } from "@/lib/api";
import { pageMeta } from "@/lib/site";
import { LessonPlayer } from "@/components/learn/LessonPlayer";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ slug: c.slug, lessonId: l.id }))));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/learn/[slug]/[lessonId]">): Promise<Metadata> {
  const { lang, slug, lessonId } = await params;
  if (!isLang(lang)) return {};
  const found = await getLesson(slug, lessonId);
  if (!found) return {};
  return {
    ...pageMeta({
      lang,
      path: `/learn/${slug}/${lessonId}`,
      title: `${found.lesson.title[lang]} — ${found.course.title[lang]}`,
      description: found.lesson.description[lang],
      image: found.course.thumbnail,
    }),
    robots: { index: false },
  };
}

export default async function LessonPage({ params }: PageProps<"/[lang]/learn/[slug]/[lessonId]">) {
  const { lang, slug, lessonId } = await params;
  if (!isLang(lang)) notFound();
  const found = await getLesson(slug, lessonId);
  if (!found) notFound();
  return <LessonPlayer course={found.course} lessonId={lessonId} />;
}
