import { getCategories, getInstructors } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { CourseForm } from "@/components/admin/CourseForm";
import { emptyCourseValues } from "@/components/admin/courseForm.shared";
import { makeT } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/courses/new">) {
  return adminMetadata(params, "admin.courses.new");
}

export default async function AdminNewCoursePage({ params }: PageProps<"/[lang]/admin/courses/new">) {
  const lang = await adminLang(params);
  const t = makeT(lang);
  const [categories, instructors] = await Promise.all([getCategories(), getInstructors()]);
  return (
    <>
      <AdminPageHeader title={t("admin.courses.new")} lead={t("admin.courses.newLead")} />
      <CourseForm mode="create" initial={emptyCourseValues(categories[0]?.id ?? "", instructors[0]?.id ?? "")} categories={categories} instructors={instructors} />
    </>
  );
}
