/**
 * Marketing / learner-side content (paths, blog, plans, FAQ, testimonials, notifications, partners, stats).
 * The proposed contract has no endpoints for these yet, so they are served from demo data in BOTH modes
 * (documented in docs/BACKEND_INTEGRATION.md → "Content endpoints (optional, phase 2)").
 * When the backend adds them, replace the bodies here with remoteGet(...) like courses.ts does.
 */
import { faqs, notifications, partners, plans, posts, stats, testimonials } from "@/data/demo/content";
import { paths } from "@/data/demo/content";
import type { FaqItem, LearningPath, NotificationItem, Plan, Post, SearchEntry, Testimonial } from "@/types";
import { getCategories } from "./categories";
import { getCourseSummaries } from "./courses";
import { getInstructors } from "./instructors";

export async function getPaths(): Promise<LearningPath[]> { return paths; }
export async function getPath(slug: string): Promise<LearningPath | undefined> { return paths.find((p) => p.slug === slug); }
export async function getTestimonials(): Promise<Testimonial[]> { return testimonials; }
export async function getPosts(): Promise<Post[]> { return posts; }
export async function getPost(slug: string): Promise<Post | undefined> { return posts.find((p) => p.slug === slug); }
export async function getPlans(): Promise<Plan[]> { return plans; }
export async function getFaqs(): Promise<FaqItem[]> { return faqs; }
export async function getNotifications(): Promise<NotificationItem[]> { return notifications; }
export async function getPartners() { return partners; }

/** Headline numbers. Course / instructor counts are real (from the active source); the rest are demo figures. */
export async function getStats() {
  const [courses, instructors] = await Promise.all([getCourseSummaries(), getInstructors()]);
  return stats.map((s) =>
    s.id === "courses" ? { ...s, value: courses.length } : s.id === "instructors" ? { ...s, value: instructors.length } : s,
  );
}

/** Small index used by the command palette (shipped to the client once, in the layout). */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [courses, instructors, categories] = await Promise.all([getCourseSummaries(), getInstructors(), getCategories()]);
  return [
    ...courses.map<SearchEntry>((c) => ({ type: "course", id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, image: c.thumbnail })),
    ...instructors.map<SearchEntry>((i) => ({ type: "instructor", id: i.id, slug: i.slug, title: i.name, subtitle: i.title, image: i.avatar })),
    ...categories.map<SearchEntry>((c) => ({ type: "category", id: c.id, slug: c.slug, title: c.name, subtitle: c.description })),
    ...paths.map<SearchEntry>((p) => ({ type: "path", id: p.id, slug: p.slug, title: p.title, subtitle: p.description, image: p.image })),
  ];
}
