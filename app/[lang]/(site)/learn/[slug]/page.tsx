import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourse, getCourses } from "@/lib/api";
import { pageMeta } from "@/lib/site";
import { ResumeRedirect } from "@/components/learn/ResumeRedirect";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/learn/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  return { ...pageMeta({ lang, path: `/learn/${slug}`, title: course.title[lang] }), robots: { index: false } };
}

export default async function LearnResumePage({ params }: PageProps<"/[lang]/learn/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const course = await getCourse(slug);
  if (!course) notFound();
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  return <ResumeRedirect slug={slug} lessonIds={lessonIds} title={course.title[lang]} />;
}
