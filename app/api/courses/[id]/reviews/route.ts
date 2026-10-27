import type { NextRequest } from "next/server";
import { notFound, ok } from "@/lib/api/demo/http";
import { demoCourse, demoReviews } from "@/lib/api/demo/service";
import { reviewToDTO } from "@/lib/api/mappers";

/** GET /api/courses/{idOrSlug}/reviews */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/courses/[id]/reviews">) {
  const { id } = await ctx.params;
  const c = demoCourse(id);
  if (!c) return notFound("Course");
  const list = demoReviews(id).map((r) => reviewToDTO(r, c.id));
  return ok(list, { page: 1, pageSize: list.length || 1, total: list.length, totalPages: 1 });
}
