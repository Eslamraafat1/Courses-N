import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { getCourseSummaries } from "@/lib/api";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { WishlistView } from "@/components/dashboard/SavedViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/wishlist">) {
  return privateMeta(params, "/wishlist", "dash.wishlist.title", "dash.wishlist.lead");
}

export default async function Page({ params }: PageProps<"/[lang]/wishlist">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const courses = await getCourseSummaries();
  return <WishlistView courses={courses} />;
}
