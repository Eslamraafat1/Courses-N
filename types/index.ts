export type Lang = "ar" | "en";

/** Bilingual string used by all demo data. */
export type L = { ar: string; en: string };

export type Level = "beginner" | "intermediate" | "advanced";

export type VideoProvider = "youtube" | "vimeo" | "mp4";

export interface Category {
  id: string;
  slug: string;
  name: L;
  description: L;
  /** lucide icon name, resolved in components/ui/DynamicIcon */
  icon: string;
  /** tailwind-friendly CSS color used for accents */
  color: string;
  image: string;
  featured?: boolean;
}

export interface Instructor {
  id: string;
  slug: string;
  name: L;
  title: L;
  bio: L;
  avatar: string;
  expertise: string[];
  rating: number;
  students: number;
  social: { website?: string; x?: string; linkedin?: string; youtube?: string };
}

export interface Resource {
  id: string;
  title: L;
  kind: "pdf" | "link" | "code" | "slides";
  href: string;
}

export interface Lesson {
  id: string;
  title: L;
  description: L;
  /** minutes */
  duration: number;
  videoUrl: string;
  provider: VideoProvider;
  thumbnail?: string;
  preview?: boolean;
  resources?: Resource[];
}

export interface Module {
  id: string;
  title: L;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: L;
  subtitle: L;
  description: L;
  thumbnail: string;
  /** wide hero image for the details page (falls back to thumbnail) */
  coverImage?: string;
  /** preview/trailer video */
  videoUrl: string;
  provider: VideoProvider;
  /** total hours */
  duration: number;
  level: Level;
  categoryId: string;
  instructorId: string;
  price: number; // USD, 0 = free
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  students: number;
  /** ISO date */
  publishedAt: string;
  tags: string[];
  outcomes: L[];
  requirements: L[];
  modules: Module[];
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  accent: string;
}

export interface PathStage {
  id: string;
  title: L;
  description: L;
  courseSlug: string;
}

export interface LearningPath {
  id: string;
  slug: string;
  title: L;
  description: L;
  image: string;
  level: Level;
  weeks: number;
  accent: string;
  stages: PathStage[];
}

export interface Review {
  id: string;
  courseSlug: string;
  author: L;
  avatar: string;
  rating: number;
  date: string;
  text: L;
  role?: L;
}

export interface Testimonial {
  id: string;
  name: L;
  role: L;
  avatar: string;
  quote: L;
  outcome: L;
}

export interface Post {
  id: string;
  slug: string;
  title: L;
  excerpt: L;
  body: L[];
  image: string;
  author: L;
  date: string;
  readMinutes: number;
  tag: L;
}

export interface Plan {
  id: string;
  name: L;
  /** USD per month, 0 = free */
  price: number;
  yearly: number;
  tagline: L;
  features: L[];
  highlighted?: boolean;
}

export interface FaqItem {
  id: string;
  q: L;
  a: L;
  group: "general" | "billing" | "learning";
}

export interface NotificationItem {
  id: string;
  title: L;
  body: L;
  time: string;
  kind: "course" | "system" | "reminder";
  read: boolean;
}

export interface Partner {
  id: string;
  name: string;
}

/** Light-weight course shape for lists / client components (no curriculum payload). */
export type CourseSummary = Omit<Course, "modules" | "outcomes" | "requirements" | "description"> & CourseRefs & {
  lessonsCount: number;
  firstLessonId: string;
  description: L;
};

export interface SearchEntry {
  type: "course" | "instructor" | "category" | "path";
  id: string;
  slug: string;
  title: L;
  subtitle: L;
  image?: string;
}

export interface ParsedVideo {
  provider: VideoProvider;
  /** URL safe to put in an iframe (youtube/vimeo) or <video> (mp4) */
  src: string;
  /** Original watch URL for the "open on provider" fallback */
  watchUrl: string;
  /** Auto thumbnail when available */
  poster?: string;
}

/** Denormalised refs attached to every CourseSummary so cards never need extra lookups. */
export interface CourseRefs {
  instructor: { slug: string; name: L; avatar: string };
  category: { slug: string; name: L; color: string };
}
