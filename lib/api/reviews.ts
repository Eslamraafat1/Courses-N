import type { Review } from "@/types";
import { reviews as demoAll } from "@/data/demo/content";
import { endpoints } from "./endpoints";
import { remoteGet } from "./remote";
import { reviewFromDTO } from "./mappers";
import { getCourses } from "./courses";
import { source } from "./source";
import type { ReviewDTO } from "./types";

/** Reviews of one course, or all reviews (admin/overview) when no slug is given. */
export function getReviews(courseSlug?: string): Promise<Review[]> {
  return source(
    () => (courseSlug ? demoAll.filter((r) => r.courseSlug === courseSlug) : demoAll),
    async () => {
      if (courseSlug) {
        const res = await remoteGet<ReviewDTO[]>(endpoints.courseReviews(courseSlug));
        return res.data.map((d) => reviewFromDTO(d, courseSlug));
      }
      const all = await getCourses();
      return (await Promise.all(all.map((c) => getReviews(c.slug)))).flat();
    },
  );
}
