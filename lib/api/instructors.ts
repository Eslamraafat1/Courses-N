import type { Instructor } from "@/types";
import { endpoints } from "./endpoints";
import { remoteGet } from "./remote";
import { instructorFromDTO } from "./mappers";
import { demoInstructors } from "./demo/service";
import { source } from "./source";
import type { InstructorDTO } from "./types";

export const getInstructors = (): Promise<Instructor[]> =>
  source(demoInstructors, async () => (await remoteGet<InstructorDTO[]>(endpoints.instructors)).data.map(instructorFromDTO));

export async function getInstructor(slug: string): Promise<Instructor | undefined> {
  return (await getInstructors()).find((i) => i.slug === slug || i.id === slug);
}
