import { ok } from "@/lib/api/demo/http";
import { demoInstructors } from "@/lib/api/demo/service";
import { instructorToDTO } from "@/lib/api/mappers";

/** GET /api/instructors */
export async function GET() {
  return ok(demoInstructors().map(instructorToDTO));
}
