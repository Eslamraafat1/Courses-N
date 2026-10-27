import { ok } from "@/lib/api/demo/http";
import { demoCategories, demoCoursesAll } from "@/lib/api/demo/service";
import { categoryToDTO } from "@/lib/api/mappers";

/** GET /api/categories */
export async function GET() {
  const courses = demoCoursesAll();
  return ok(demoCategories().map((c) => categoryToDTO(c, courses.filter((x) => x.categoryId === c.id).length)));
}
