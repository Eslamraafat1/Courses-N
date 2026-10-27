import { getCourseSummaries, getInstructors } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { InstructorsView } from "@/components/admin/CatalogViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/instructors">) {
  return adminMetadata(params, "admin.instructors.title");
}

export default async function AdminInstructorsPage({ params }: PageProps<"/[lang]/admin/instructors">) {
  await adminLang(params);
  const [instructors, courses] = await Promise.all([getInstructors(), getCourseSummaries()]);
  const counts: Record<string, number> = {};
  for (const c of courses) counts[c.instructorId] = (counts[c.instructorId] ?? 0) + 1;
  return <InstructorsView instructors={instructors} counts={counts} />;
}
