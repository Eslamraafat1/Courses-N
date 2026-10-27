import type { NextRequest } from "next/server";
import { notFound, ok } from "@/lib/api/demo/http";
import { demoInstructor } from "@/lib/api/demo/service";
import { instructorToDTO } from "@/lib/api/mappers";

/** GET /api/instructors/{idOrSlug} */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/instructors/[id]">) {
  const { id } = await ctx.params;
  const i = demoInstructor(id);
  return i ? ok(instructorToDTO(i)) : notFound("Instructor");
}
