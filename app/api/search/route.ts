import type { NextRequest } from "next/server";
import { ok, zodFail, searchSchema } from "@/lib/api/demo/http";
import { demoCourse, demoSearch } from "@/lib/api/demo/service";
import { categoryToDTO, courseToDTO, instructorToDTO } from "@/lib/api/mappers";

/** GET /api/search?q=… — courses, instructors and categories matching the query. */
export async function GET(req: NextRequest) {
  const parsed = searchSchema.safeParse({ q: req.nextUrl.searchParams.get("q") ?? "" });
  if (!parsed.success) return zodFail(parsed.error);
  const r = demoSearch(parsed.data.q);
  return ok({
    query: parsed.data.q,
    courses: r.courses.map((s) => courseToDTO(demoCourse(s.id)!)),
    instructors: r.instructors.map(instructorToDTO),
    categories: r.categories.map((c) => categoryToDTO(c)),
  });
}
