import { getCourses, getReviews } from "@/lib/api";
import { extraDemoReviews } from "@/data/adminDemo";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { ReviewsView } from "@/components/admin/ReviewsView";
import type { L } from "@/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/reviews">) {
  return adminMetadata(params, "admin.reviews.title");
}

export default async function AdminReviewsPage({ params }: PageProps<"/[lang]/admin/reviews">) {
  await adminLang(params);
  const [reviews, courses] = await Promise.all([getReviews(), getCourses()]);
  const titles: Record<string, L> = Object.fromEntries(courses.map((c) => [c.slug, c.title]));
  return <ReviewsView reviews={[...reviews, ...extraDemoReviews]} courseTitles={titles} />;
}
