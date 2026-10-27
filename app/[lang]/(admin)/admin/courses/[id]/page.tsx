import { notFound } from "next/navigation";
import { getCategories, getCourses, getInstructors } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { CourseForm } from "@/components/admin/CourseForm";
import { courseToFormValues } from "@/components/admin/courseForm.shared";
import { makeT } from "@/lib/i18n";
import { courses } from "@/data/courses";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/courses/[id]">) {
  return adminMetadata(params, "admin.courses.edit");
}

export default async function AdminEditCoursePage({ params }: PageProps<"/[lang]/admin/courses/[id]">) {
  const lang = await adminLang(params);
  const { id } = await params;
  const course = (await getCourses()).find((c) => c.id === id);
  if (!course) notFound();
  const t = makeT(lang);
  const [categories, instructors] = await Promise.all([getCategories(), getInstructors()]);
  return (
    <>
      <AdminPageHeader title={`${t("admin.courses.edit")}: ${course.title[lang]}`} lead={t("admin.courses.editLead")} />
      <CourseForm key={course.id} mode="edit" initial={courseToFormValues(course)} categories={categories} instructors={instructors} />
    </>
  );
}
