import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourseSummaries, getPaths } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { PathsIndex } from "@/components/pages/PathsIndex";

export async function generateMetadata({ params }: PageProps<"/[lang]/paths">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/paths", title: t("nav.paths"), description: t("paths.metaDesc") });
}

export default async function PathsPage({ params }: PageProps<"/[lang]/paths">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [paths, courses] = await Promise.all([getPaths(), getCourseSummaries()]);
  const counts = Object.fromEntries(courses.map((c) => [c.slug, c.lessonsCount]));
  return (
    <>
      <PageHeader eyebrow={t("paths.eyebrow")} title={t("paths.title")} lead={t("paths.lead")} crumbs={[{ label: t("nav.paths") }]} />
      <PathsIndex paths={paths} counts={counts} />
    </>
  );
}
