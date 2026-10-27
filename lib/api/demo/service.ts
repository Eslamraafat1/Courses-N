/**
 * Demo service: the in-memory "backend". Used (a) directly by server-side data functions in demo mode and
 * (b) by the /api Route Handlers. Pure & synchronous over data/demo/* — no network, no persistence.
 * Filtering/sorting reuses lib/catalog.ts so the UI and the API can never disagree.
 */
import { categories } from "@/data/demo/categories";
import { courses } from "@/data/demo/courses";
import { instructors } from "@/data/demo/instructors";
import { reviews } from "@/data/demo/content";
import { baseState, filterCourses, matchEntries, relevance, type CatalogState, type DurationKey } from "@/lib/catalog";
import { summarize } from "@/lib/api/summarize";
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from "../config";
import type { CourseListQuery, PageMeta } from "../types";
import type { Course, CourseSummary, Instructor, Level, Review, SearchEntry } from "@/types";

const bySlugOrId = <T extends { id: string; slug: string }>(list: T[], key: string) => list.find((x) => x.slug === key || x.id === key);

export const demoCategories = () => categories;
export const demoInstructors = () => instructors;
export const demoInstructor = (key: string): Instructor | undefined => bySlugOrId(instructors, key);
export const demoCourse = (key: string): Course | undefined => bySlugOrId(courses, key);
export const demoReviews = (key: string): Review[] => {
  const c = demoCourse(key);
  return c ? reviews.filter((r) => r.courseSlug === c.slug) : [];
};

export function demoCoursesAll(): Course[] {
  return courses;
}

/** Translate the public query (slugs, flags) into the catalog engine state, then filter, sort and paginate. */
export function demoListCourses(q: CourseListQuery): { items: CourseSummary[]; meta: PageMeta } {
  const state: CatalogState = {
    ...baseState,
    q: q.q ?? "",
    categories: q.category ?? [],
    levels: (q.level ?? []) as Level[],
    instructors: q.instructor ?? [],
    durations: (q.duration ?? []) as DurationKey[],
    price: q.price ?? "all",
    maxPrice: q.maxPrice ?? null,
    minRating: q.minRating ?? 0,
    sort: q.sort ?? "popular",
  };
  let pool = courses.map((c) => summarize(c, instructors, categories));
  if (q.featured) pool = pool.filter((c) => c.featured);
  if (q.trending) pool = pool.filter((c) => c.trending);
  if (q.isNew) pool = pool.filter((c) => c.isNew);

  const filtered = filterCourses(pool, state);
  const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, q.pageSize ?? PAGE_SIZE_DEFAULT));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(totalPages, Math.max(1, q.page ?? 1));
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), meta: { page, pageSize, total, totalPages } };
}

export function demoSearch(query: string) {
  const index: SearchEntry[] = [
    ...categories.map<SearchEntry>((c) => ({ type: "category", id: c.id, slug: c.slug, title: c.name, subtitle: c.description })),
    ...instructors.map<SearchEntry>((i) => ({ type: "instructor", id: i.id, slug: i.slug, title: i.name, subtitle: i.title, image: i.avatar })),
  ];
  const summaries = courses.map((c) => summarize(c, instructors, categories));
  const hits = filterCourses(summaries, { ...baseState, q: query }).sort((a, b) => relevance(b, query) - relevance(a, query));
  return {
    courses: hits.slice(0, 12),
    instructors: matchEntries(index, query, "instructor").map((e) => instructors.find((i) => i.id === e.id)!).filter(Boolean),
    categories: matchEntries(index, query, "category").map((e) => categories.find((c) => c.id === e.id)!).filter(Boolean),
  };
}
