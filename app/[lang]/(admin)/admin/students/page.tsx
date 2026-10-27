import { adminLang, adminMetadata } from "@/components/admin/meta";
import { StudentsView } from "@/components/admin/CatalogViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/students">) {
  return adminMetadata(params, "admin.students.title");
}

export default async function AdminStudentsPage({ params }: PageProps<"/[lang]/admin/students">) {
  await adminLang(params);
  return <StudentsView />;
}
