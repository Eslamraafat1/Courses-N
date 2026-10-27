import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { MyLearningView } from "@/components/dashboard/LearningViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/my-learning">) {
  return privateMeta(params, "/dashboard/my-learning", "dash.learning.title", "dash.learning.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/dashboard/my-learning">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const courses = await getCourseSummaries();
  return <MyLearningView courses={courses} />;
}
