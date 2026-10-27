/**
 * Course data access (server side). UI code imports from "@/lib/api" only — never from data/*.
 * Demo mode → demo service. Backend mode → real API through remoteGet + mappers (see source.ts for the dev fallback).
 */
import type { Category, Course, CourseSummary, Instructor, Lesson } from "@/types";
import { endpoints } from "./endpoints";
import { remoteGet } from "./remote";
import { courseFromDTO } from "./mappers";
import { summarize } from "./summarize";
import { demoCategories, demoCourse, demoCoursesAll, demoInstructors, demoListCourses } from "./demo/service";
import { getCategories } from "./categories";
import { getInstructors } from "./instructors";
import { isApiError } from "./errors";
import { source } from "./source";
import type { CourseDTO, CourseListQuery, PageMeta } from "./types";

type CoursePage = { items: CourseSummary[]; meta: PageMeta };

function summaryFromDTO(dto: CourseDTO, instructors: Instructor[], categories: Category[]): CourseSummary {
  const base = summarize(courseFromDTO(dto), instructors, categories);
  return { ...base, lessonsCount: dto.lessonsCount ?? base.lessonsCount };
}

/** One page of course summaries, filtered/sorted/paginated by the active data source. */
export function listCourses(query: CourseListQuery = {}): Promise<CoursePage> {
  return source<CoursePage>(
    () => demoListCourses(query),
    async () => {
      const [instructors, categories] = await Promise.all([getInstructors(), getCategories()]);
      const res = await remoteGet<CourseDTO[]>(endpoints.courses, {
        q: query.q, category: query.category?.join(","), level: query.level?.join(","), instructor: query.instructor?.join(","),
        duration: query.duration?.join(","), price: query.price, maxPrice: query.maxPrice, minRating: query.minRating, sort: query.sort,
        featured: query.featured, trending: query.trending, new: query.isNew, page: query.page, pageSize: query.pageSize,
      });
      const meta = res.meta ?? { page: 1, pageSize: res.data.length, total: res.data.length, totalPages: 1 };
      return { items: res.data.map((d) => summaryFromDTO(d, instructors, categories)), meta };
    },
  );
}

/** Every course summary (walks all pages, capped for safety). */
export function getCourseSummaries(): Promise<CourseSummary[]> {
  return source(
    () => demoCoursesAll().map((c) => summarize(c, demoInstructors(), demoCategories())),
    async () => {
      const out: CourseSummary[] = [];
      for (let page = 1; page <= 10; page++) {
        const { items, meta } = await listCourses({ page, pageSize: 50 });
        out.push(...items);
        if (page >= meta.totalPages) break;
      }
      return out;
    },
  );
}

export function getCourse(slug: string): Promise<Course | undefined> {
  return source<Course | undefined>(
    () => demoCourse(slug),
    async () => {
      try {
        return courseFromDTO((await remoteGet<CourseDTO>(endpoints.course(slug))).data);
      } catch (e) {
        if (isApiError(e) && e.status === 404) return undefined;
        throw e;
      }
    },
  );
}

export function getCourses(): Promise<Course[]> {
  return source(
    () => demoCoursesAll(),
    async () => {
      const slugs = (await getCourseSummaries()).map((c) => c.slug);
      return (await Promise.all(slugs.map((s) => getCourse(s)))).filter((c): c is Course => !!c);
    },
  );
}

export async function getCoursesByCategory(categoryId: string) {
  const [all, cats] = await Promise.all([getCourseSummaries(), getCategories()]);
  const slug = cats.find((c) => c.id === categoryId)?.slug;
  return all.filter((c) => c.category.slug === slug);
}
export async function getCoursesByInstructor(instructorId: string) {
  const [all, ins] = await Promise.all([getCourseSummaries(), getInstructors()]);
  const slug = ins.find((i) => i.id === instructorId)?.slug;
  return all.filter((c) => c.instructor.slug === slug);
}
export async function getFeaturedCourses() {
  return (await getCourseSummaries()).filter((c) => c.featured);
}
export async function getTrendingCourses() {
  return (await getCourseSummaries()).filter((c) => c.trending);
}
export async function getNewCourses() {
  return (await getCourseSummaries()).filter((c) => c.isNew).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export async function getRelatedCourses(slug: string, limit = 3): Promise<CourseSummary[]> {
  const all = await getCourseSummaries();
  const base = all.find((c) => c.slug === slug);
  if (!base) return [];
  return all
    .filter((c) => c.slug !== slug)
    .map((c) => ({ c, score: (c.category.slug === base.category.slug ? 2 : 0) + c.tags.filter((t) => base.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.c.rating - a.c.rating)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Flat lesson lookup used by the player. */
export async function getLesson(courseSlug: string, lessonId: string) {
  const course = await getCourse(courseSlug);
  if (!course) return undefined;
  const lessons: Lesson[] = course.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return undefined;
  return { course, lesson: lessons[index], index, prev: lessons[index - 1], next: lessons[index + 1], total: lessons.length };
}
