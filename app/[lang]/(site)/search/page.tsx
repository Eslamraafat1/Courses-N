import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourseSummaries, getSearchIndex } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchResults } from "@/components/courses/SearchResults";
import { CatalogSkeleton } from "@/components/courses/CatalogParts";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  const meta = pageMeta({ lang, path: "/search", title: t("searchPage.title"), description: t("searchPage.lead") });
  return { ...meta, robots: { index: false, follow: true } };
}

export default async function SearchPage({ params }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [courses, index] = await Promise.all([getCourseSummaries(), getSearchIndex()]);

  // most used tags become the "popular topics" suggestions
  const freq = new Map<string, number>();
  for (const c of courses) for (const tag of c.tags) freq.set(tag, (freq.get(tag) ?? 0) + 1);
  const suggestions = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([tag]) => tag);

  return (
    <>
      <PageHeader eyebrow={t("searchPage.eyebrow")} title={t("searchPage.title")} lead={t("searchPage.lead")} crumbs={[{ label: t("searchPage.title") }]} />
      <Suspense fallback={<div className="container-x py-10"><CatalogSkeleton count={3} /></div>}>
        <SearchResults courses={courses} entries={index.filter((e) => e.type !== "course")} suggestions={suggestions} />
      </Suspense>
    </>
  );
}
