import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, LOCALES } from "@/lib/i18n/config";
import { pageMeta } from "@/lib/site";
import { getCourseSummaries, getPath, getPaths } from "@/lib/api";
import { PathDetail } from "@/components/pages/PathDetail";

export async function generateStaticParams() {
  const paths = await getPaths();
  return LOCALES.flatMap((lang) => paths.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/paths/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const path = await getPath(slug);
  if (!path) return {};
  return pageMeta({ lang, path: `/paths/${slug}`, title: path.title[lang], description: path.description[lang], image: path.image });
}

export default async function PathPage({ params }: PageProps<"/[lang]/paths/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const [path, all, courses] = await Promise.all([getPath(slug), getPaths(), getCourseSummaries()]);
  if (!path) notFound();
  const bySlug = Object.fromEntries(courses.map((c) => [c.slug, c]));
  const used = Object.fromEntries(path.stages.map((s) => [s.courseSlug, bySlug[s.courseSlug]]));
  const counts = Object.fromEntries(courses.map((c) => [c.slug, c.lessonsCount]));
  return <PathDetail path={path} courses={used} counts={counts} others={all.filter((p) => p.slug !== slug)} />;
}
