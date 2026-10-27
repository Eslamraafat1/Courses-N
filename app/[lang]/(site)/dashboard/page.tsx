import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries, getNotifications } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { DashboardView } from "@/components/dashboard/DashboardView";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">) {
  return privateMeta(params, "/dashboard", "dash.title", "dash.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [courses, notifications] = await Promise.all([getCourseSummaries(), getNotifications()]);
  return <DashboardView courses={courses} notifications={notifications} />;
}
