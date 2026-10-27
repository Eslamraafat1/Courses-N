"use client";
import { useEffect } from "react";
import { useRecent } from "@/hooks/useLearning";

/** Renders nothing; records the course in "recently viewed" (localStorage) once per visit. */
export function CourseViewTracker({ slug }: { slug: string }) {
  const { push } = useRecent();
  useEffect(() => {
    push(slug);
  }, [slug, push]);
  return null;
}
