import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { ProfileView } from "@/components/dashboard/ProfileView";

export async function generateMetadata({ params }: PageProps<"/[lang]/profile">) {
  return privateMeta(params, "/profile", "account.profile.title", "account.profile.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/profile">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const courses = await getCourseSummaries();
  return <ProfileView courses={courses} />;
}
