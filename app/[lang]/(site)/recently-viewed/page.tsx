import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { RecentView } from "@/components/dashboard/SavedViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/recently-viewed">) {
  return privateMeta(params, "/recently-viewed", "dash.recent.title", "dash.recent.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/recently-viewed">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const courses = await getCourseSummaries();
  return <RecentView courses={courses} />;
}
