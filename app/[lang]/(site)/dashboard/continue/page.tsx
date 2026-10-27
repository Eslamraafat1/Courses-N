import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { ContinueView } from "@/components/dashboard/LearningViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/continue">) {
  return privateMeta(params, "/dashboard/continue", "dash.continue.title", "dash.continue.pageLead");
}

export default async function Page({ params }: PageProps<"/[lang]/dashboard/continue">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const courses = await getCourseSummaries();
  return <ContinueView courses={courses} />;
}
