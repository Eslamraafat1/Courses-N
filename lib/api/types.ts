/**
 * API contract (PROPOSAL — to be reviewed and agreed with the backend developer, see docs/BACKEND_INTEGRATION.md).
 * These are the wire formats (JSON). The UI works with the domain types in /types; lib/api/mappers.ts converts.
 * Bilingual text is always `{ ar, en }`. Dates are ISO-8601 strings. Money is a number in USD.
 * (R) = required, (O) = optional.
 */
export interface LocalizedText {
  ar: string;
  en: string;
}

export type LevelDTO = "beginner" | "intermediate" | "advanced";
export type VideoProviderDTO = "youtube" | "vimeo" | "mp4";

/* ---------------- envelopes ---------------- */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface ApiEnvelope<T> {
  data: T;
  meta?: PageMeta;
  /** true when served by the built-in Demo API */
  demo?: boolean;
}
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** field → messages (validation_failed) */
    details?: Record<string, string[]>;
  };
}

/* ---------------- resources ---------------- */
export interface CategoryDTO {
  id: string; // (R)
  slug: string; // (R) unique, URL-safe
  name: LocalizedText; // (R)
  description: LocalizedText; // (R)
  icon: string; // (R) icon key
  color: string; // (R) CSS color
  imageUrl: string; // (R) absolute https URL
  featured?: boolean; // (O)
  coursesCount?: number; // (O)
}

export interface InstructorDTO {
  id: string;
  slug: string;
  name: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
  avatarUrl: string; // (R) absolute https URL
  expertise: string[];
  rating: number; // 0–5
  studentsCount: number;
  social?: { website?: string; x?: string; linkedin?: string; youtube?: string };
}

export interface ResourceDTO {
  id: string;
  title: LocalizedText;
  kind: "pdf" | "link" | "code" | "slides";
  url: string;
}

export interface LessonDTO {
  id: string; // (R)
  title: LocalizedText; // (R)
  description: LocalizedText; // (R)
  durationMinutes: number; // (R)
  videoUrl: string; // (R) normal watch/page/file URL — NOT necessarily an embed URL
  provider: VideoProviderDTO; // (R)
  thumbnailUrl?: string; // (O)
  preview?: boolean; // (O) playable without enrolment
  resources?: ResourceDTO[]; // (O)
}

export interface ModuleDTO {
  id: string;
  title: LocalizedText;
  lessons: LessonDTO[];
}

export interface CourseDTO {
  id: string; // (R)
  slug: string; // (R) unique, URL-safe
  title: LocalizedText; // (R)
  subtitle: LocalizedText; // (R)
  description: LocalizedText; // (R)
  thumbnailUrl: string; // (R) 16:10 card image, ≥ 800px wide
  coverImageUrl: string; // (R) wide hero image, ≥ 1600px wide
  instructorImageUrl?: string; // (O) usually derived from instructor.avatarUrl
  videoUrl: string; // (R) preview/trailer video link
  provider: VideoProviderDTO; // (R)
  durationHours: number; // (R)
  level: LevelDTO; // (R)
  categoryId: string; // (R)
  instructorId: string; // (R)
  price: number; // (R) 0 = free
  oldPrice?: number; // (O)
  rating: number; // (R) 0–5
  reviewsCount: number; // (R)
  studentsCount: number; // (R)
  publishedAt: string; // (R) ISO date
  tags: string[]; // (R)
  outcomes: LocalizedText[]; // (R)
  requirements: LocalizedText[]; // (R)
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  accent?: string; // (O) CSS color
  lessonsCount?: number; // (O) list endpoints may omit `modules` and send only this
  modules?: ModuleDTO[]; // (O) present on GET /courses/{id}
}

export interface ReviewDTO {
  id: string;
  courseId: string;
  authorName: LocalizedText; // display name only — no emails / personal data
  authorAvatarUrl?: string;
  rating: number; // 1–5
  createdAt: string;
  text: LocalizedText;
  authorRole?: LocalizedText;
}

/* ---------------- queries ---------------- */
export type CourseSort = "popular" | "newest" | "rating" | "priceAsc" | "priceDesc" | "duration";

export interface CourseListQuery {
  q?: string;
  category?: string[]; // category slugs
  level?: LevelDTO[];
  instructor?: string[]; // instructor slugs
  duration?: ("short" | "medium" | "long")[];
  price?: "all" | "free" | "paid";
  maxPrice?: number;
  minRating?: number;
  sort?: CourseSort;
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  page?: number; // 1-based
  pageSize?: number;
}

/* ---------------- search / forms ---------------- */
export interface SearchResultsDTO {
  query: string;
  courses: CourseDTO[];
  instructors: InstructorDTO[];
  categories: CategoryDTO[];
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}
export interface NewsletterRequest {
  email: string;
}
/** Result of a form POST. In demo mode `delivered` is ALWAYS false and `demo` true. */
export interface FormResultDTO {
  accepted: boolean;
  delivered: boolean;
  demo: boolean;
  message: string;
}

/* ---------------- auth ---------------- */
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest extends LoginRequest {
  name: string;
}
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "student" | "instructor" | "admin";
}
export interface SessionDTO {
  user: UserDTO | null;
  /** demo mode never authenticates anyone */
  demo?: boolean;
}
