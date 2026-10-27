import type { Lang } from "@/types";
import { getCourseSummaries, getStats } from "@/lib/api";
import { HeroCarousel } from "./parts/HeroCarousel";

/**
 * Cinematic course carousel. The slide copy is rendered in the server HTML of the first slide (via the client
 * component's initial state), so the LCP content never waits for 3D or animation libraries.
 */
export async function Hero({ lang }: { lang: Lang }) {
  const [all, stats] = await Promise.all([getCourseSummaries(), getStats()]);
  // featured first, then trending, then best rated — unique, 6 slides, each needs a wide image
  const ranked = [...all].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.trending) - Number(!!a.trending) || b.rating - a.rating);
  const courses = ranked.slice(0, 6);
  const students = stats.find((s) => s.id === "students");

  return (
    <HeroCarousel
      courses={courses}
      stats={{ students: students?.value ?? 0, studentsSuffix: students?.suffix ?? "", studentsLabel: students?.label[lang] ?? "" }}
    />
  );
}
