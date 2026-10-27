import { getCategories, getCourseSummaries, getCourses, getInstructors } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { OverviewView } from "@/components/admin/OverviewView";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin">) {
  return adminMetadata(params, "admin.overview.title");
}

export default async function AdminOverviewPage({ params }: PageProps<"/[lang]/admin">) {
  await adminLang(params);
  const [summaries, categories, instructors, full] = await Promise.all([getCourseSummaries(), getCategories(), getInstructors(), getCourses()]);
  const lessonsTotal = full.reduce((s, c) => s + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0);
  return <OverviewView courses={summaries} categories={categories} lessonsTotal={lessonsTotal} instructorsCount={instructors.length} />;
}
