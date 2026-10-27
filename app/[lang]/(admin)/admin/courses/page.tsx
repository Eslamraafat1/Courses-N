import { getCategories, getCourseSummaries } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { CoursesView } from "@/components/admin/CoursesView";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/courses">) {
  return adminMetadata(params, "admin.courses.title");
}

export default async function AdminCoursesPage({ params }: PageProps<"/[lang]/admin/courses">) {
  await adminLang(params);
  const [courses, categories] = await Promise.all([getCourseSummaries(), getCategories()]);
  return <CoursesView courses={courses} categories={categories} />;
}
