import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCourseSummaries, getInstructors } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { InstructorsIndex } from "@/components/pages/InstructorsIndex";

export async function generateMetadata({ params }: PageProps<"/[lang]/instructors">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/instructors", title: t("nav.instructors"), description: t("instructors.metaDesc") });
}

export default async function InstructorsPage({ params }: PageProps<"/[lang]/instructors">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [instructors, courses] = await Promise.all([getInstructors(), getCourseSummaries()]);
  const counts: Record<string, number> = {};
  for (const c of courses) {
    const ins = instructors.find((i) => i.slug === c.instructor.slug);
    if (ins) counts[ins.id] = (counts[ins.id] ?? 0) + 1;
  }
  return (
    <>
      <PageHeader eyebrow={t("instructors.eyebrow")} title={t("instructors.title")} lead={t("instructors.lead")} crumbs={[{ label: t("nav.instructors") }]} />
      <InstructorsIndex instructors={instructors} courseCounts={counts} />
    </>
  );
}
