import type { NextRequest } from "next/server";
import { fail, ok, parseCourseQuery } from "@/lib/api/demo/http";
import { demoListCourses } from "@/lib/api/demo/service";
import { courseToDTO } from "@/lib/api/mappers";
import { demoCourse } from "@/lib/api/demo/service";

/** GET /api/courses — filter, search, sort, paginate (Demo API). */
export async function GET(req: NextRequest) {
  const parsed = parseCourseQuery(req.nextUrl.searchParams);
  if (!parsed.ok) return parsed.res;
  try {
    const { items, meta } = demoListCourses(parsed.query);
    return ok(items.map((s) => courseToDTO(demoCourse(s.id)!)), meta);
  } catch {
    return fail(500, "server_error", "Unexpected error");
  }
}
