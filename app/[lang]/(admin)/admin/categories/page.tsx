import { getCategories, getCourseSummaries } from "@/lib/api";
import { adminLang, adminMetadata } from "@/components/admin/meta";
import { CategoriesView } from "@/components/admin/CatalogViews";

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/categories">) {
  return adminMetadata(params, "admin.categories.title");
}

export default async function AdminCategoriesPage({ params }: PageProps<"/[lang]/admin/categories">) {
  await adminLang(params);
  const [categories, courses] = await Promise.all([getCategories(), getCourseSummaries()]);
  const counts: Record<string, number> = {};
  for (const c of courses) counts[c.categoryId] = (counts[c.categoryId] ?? 0) + 1;
  return <CategoriesView categories={categories} counts={counts} />;
}
