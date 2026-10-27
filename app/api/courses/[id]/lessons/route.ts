import type { NextRequest } from "next/server";
import { notFound, ok } from "@/lib/api/demo/http";
import { demoCourse } from "@/lib/api/demo/service";
import { courseToDTO } from "@/lib/api/mappers";

/** GET /api/courses/{idOrSlug}/lessons — modules with lessons. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/courses/[id]/lessons">) {
  const { id } = await ctx.params;
  const c = demoCourse(id);
  return c ? ok(courseToDTO(c, { withModules: true }).modules ?? []) : notFound("Course");
}
