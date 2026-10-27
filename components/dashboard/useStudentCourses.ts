"use client";
import { useMemo } from "react";
import type { CourseSummary } from "@/types";
import { useLastLesson, useProgress } from "@/hooks/useLearning";

export interface StudentCourse {
  course: CourseSummary;
  done: number;
  total: number;
  pct: number;
  completed: boolean;
  /** href (without locale) that resumes the learner where they stopped */
  resumeHref: string;
}

/** Courses the learner has started (from local progress), with percent + resume link. */
export function useStudentCourses(courses: CourseSummary[]) {
  const { map, isSeed, percent } = useProgress();
  const last = useLastLesson();

  const items = useMemo<StudentCourse[]>(
    () =>
      courses
        .filter((c) => (map[c.slug]?.length ?? 0) > 0)
        .map((c) => {
          const pct = percent(c.slug, c.lessonsCount);
          const lessonId = last.map[c.slug] ?? c.firstLessonId;
          return {
            course: c,
            done: map[c.slug].length,
            total: c.lessonsCount,
            pct,
            completed: pct >= 100,
            resumeHref: lessonId ? `/learn/${c.slug}/${lessonId}` : `/learn/${c.slug}`,
          };
        }),
    [courses, map, percent, last.map],
  );

  return { items, isSeed, active: items.filter((i) => !i.completed), finished: items.filter((i) => i.completed) };
}

/** Resolve slugs (wishlist / recent) to CourseSummary, dropping unknown ones, preserving order. */
export function resolveSlugs(slugs: string[], courses: CourseSummary[]): CourseSummary[] {
  const bySlug = new Map(courses.map((c) => [c.slug, c]));
  return slugs.map((s) => bySlug.get(s)).filter((c): c is CourseSummary => !!c);
}
