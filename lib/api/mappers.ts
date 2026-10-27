/**
 * Wire format (DTO) <-> UI domain types (/types). This is the ONLY place that knows both shapes,
 * so renaming a backend field means editing this file, not the UI.
 */
import type { Category, Course, Instructor, Lesson, Module, Review } from "@/types";
import type { CategoryDTO, CourseDTO, InstructorDTO, LessonDTO, ModuleDTO, ReviewDTO } from "./types";

/* ---------- DTO -> domain (used in backend mode) ---------- */
export const categoryFromDTO = (d: CategoryDTO): Category => ({
  id: d.id, slug: d.slug, name: d.name, description: d.description, icon: d.icon, color: d.color, image: d.imageUrl, featured: d.featured,
});

export const instructorFromDTO = (d: InstructorDTO): Instructor => ({
  id: d.id, slug: d.slug, name: d.name, title: d.title, bio: d.bio, avatar: d.avatarUrl, expertise: d.expertise,
  rating: d.rating, students: d.studentsCount, social: d.social ?? {},
});

export const lessonFromDTO = (d: LessonDTO): Lesson => ({
  id: d.id, title: d.title, description: d.description, duration: d.durationMinutes, videoUrl: d.videoUrl, provider: d.provider,
  thumbnail: d.thumbnailUrl, preview: d.preview,
  resources: d.resources?.map((r) => ({ id: r.id, title: r.title, kind: r.kind, href: r.url })),
});

export const moduleFromDTO = (d: ModuleDTO): Module => ({ id: d.id, title: d.title, lessons: d.lessons.map(lessonFromDTO) });

export const courseFromDTO = (d: CourseDTO): Course => ({
  id: d.id, slug: d.slug, title: d.title, subtitle: d.subtitle, description: d.description,
  thumbnail: d.thumbnailUrl, coverImage: d.coverImageUrl, videoUrl: d.videoUrl, provider: d.provider,
  duration: d.durationHours, level: d.level, categoryId: d.categoryId, instructorId: d.instructorId,
  price: d.price, oldPrice: d.oldPrice, rating: d.rating, reviewsCount: d.reviewsCount, students: d.studentsCount,
  publishedAt: d.publishedAt, tags: d.tags, outcomes: d.outcomes, requirements: d.requirements,
  featured: d.featured, trending: d.trending, isNew: d.isNew, accent: d.accent ?? "#5233e8",
  modules: (d.modules ?? []).map(moduleFromDTO),
});

export const reviewFromDTO = (d: ReviewDTO, courseSlug: string): Review => ({
  id: d.id, courseSlug, author: d.authorName, avatar: d.authorAvatarUrl ?? "", rating: d.rating, date: d.createdAt, text: d.text, role: d.authorRole,
});

/* ---------- domain -> DTO (used by the Demo API Route Handlers) ---------- */
export const categoryToDTO = (c: Category, coursesCount?: number): CategoryDTO => ({
  id: c.id, slug: c.slug, name: c.name, description: c.description, icon: c.icon, color: c.color, imageUrl: c.image, featured: c.featured, coursesCount,
});

export const instructorToDTO = (i: Instructor): InstructorDTO => ({
  id: i.id, slug: i.slug, name: i.name, title: i.title, bio: i.bio, avatarUrl: i.avatar, expertise: i.expertise,
  rating: i.rating, studentsCount: i.students, social: i.social,
});

export const lessonToDTO = (l: Lesson): LessonDTO => ({
  id: l.id, title: l.title, description: l.description, durationMinutes: l.duration, videoUrl: l.videoUrl, provider: l.provider,
  thumbnailUrl: l.thumbnail, preview: l.preview,
  resources: l.resources?.map((r) => ({ id: r.id, title: r.title, kind: r.kind, url: r.href })),
});

export const courseToDTO = (c: Course, opts: { withModules?: boolean } = {}): CourseDTO => ({
  id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, description: c.description,
  thumbnailUrl: c.thumbnail, coverImageUrl: c.coverImage ?? c.thumbnail, videoUrl: c.videoUrl, provider: c.provider,
  durationHours: c.duration, level: c.level, categoryId: c.categoryId, instructorId: c.instructorId,
  price: c.price, oldPrice: c.oldPrice, rating: c.rating, reviewsCount: c.reviewsCount, studentsCount: c.students,
  publishedAt: c.publishedAt, tags: c.tags, outcomes: c.outcomes, requirements: c.requirements,
  featured: c.featured, trending: c.trending, isNew: c.isNew, accent: c.accent,
  lessonsCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
  ...(opts.withModules ? { modules: c.modules.map((m) => ({ id: m.id, title: m.title, lessons: m.lessons.map(lessonToDTO) })) } : {}),
});

export const reviewToDTO = (r: Review, courseId: string): ReviewDTO => ({
  id: r.id, courseId, authorName: r.author, authorAvatarUrl: r.avatar, rating: r.rating, createdAt: r.date, text: r.text, authorRole: r.role,
});
