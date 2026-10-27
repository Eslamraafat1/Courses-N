/**
 * ADMIN DEMO DATA — every record here is fictional and exists only to populate the admin UI preview.
 * No real people, emails or analytics. Replace with API calls when a backend exists.
 */
import type { L, Review } from "@/types";

export type CourseStatus = "published" | "draft" | "archived";
export type ReviewStatus = "approved" | "pending" | "hidden";
export type StudentStatus = "active" | "inactive" | "suspended";

/** Demo publication status per course id (anything not listed is "published"). */
export const demoCourseStatus: Record<string, CourseStatus> = {
  "c-mkt": "draft",
  "c-film": "draft",
  "c-biz": "archived",
};

export interface DemoStudent {
  id: string;
  name: L;
  /** reserved example.test domain: can never be a real mailbox */
  email: string;
  country: L;
  enrolled: number;
  completed: number;
  progress: number;
  joined: string;
  status: StudentStatus;
}

const countries: L[] = [
  { ar: "مصر", en: "Egypt" },
  { ar: "السعودية", en: "Saudi Arabia" },
  { ar: "الإمارات", en: "UAE" },
  { ar: "الأردن", en: "Jordan" },
  { ar: "المغرب", en: "Morocco" },
];
const statuses: StudentStatus[] = ["active", "active", "active", "inactive", "active", "suspended"];

export const demoStudents: DemoStudent[] = Array.from({ length: 24 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  const enrolled = 1 + ((i * 7) % 6);
  const completed = Math.min(enrolled, (i * 3) % 4);
  return {
    id: `demo-s-${n}`,
    name: { ar: `طالب تجريبي ${n}`, en: `Demo Student ${n}` },
    email: `student${n}@example.test`,
    country: countries[i % countries.length],
    enrolled,
    completed,
    progress: (i * 13 + 8) % 101,
    joined: `2026-${String(((i * 5) % 10) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
    status: statuses[i % statuses.length],
  };
});

/** Last 12 months, oldest first. The month index is resolved to a label in the UI. Fictional numbers. */
export const demoEnrollments: { month: string; value: number }[] = [
  ["2025-11", 412], ["2025-12", 468], ["2026-01", 530], ["2026-02", 497], ["2026-03", 622], ["2026-04", 688],
  ["2026-05", 731], ["2026-06", 702], ["2026-07", 796], ["2026-08", 874], ["2026-09", 931], ["2026-10", 1012],
].map(([month, value]) => ({ month: month as string, value: value as number }));

/** Extra pending reviews so the moderation queue has something to moderate. */
export const extraDemoReviews: Review[] = [
  { id: "dr-1", courseSlug: "react-from-scratch", author: { ar: "مراجع تجريبي أ", en: "Demo Reviewer A" }, avatar: "", rating: 2, date: "2026-10-18", text: { ar: "تعليق تجريبي: الوتيرة سريعة جدًا في الوحدة الثالثة.", en: "Demo comment: the pace is too fast in module three." } },
  { id: "dr-2", courseSlug: "python-for-beginners", author: { ar: "مراجع تجريبي ب", en: "Demo Reviewer B" }, avatar: "", rating: 1, date: "2026-10-21", text: { ar: "تعليق تجريبي يحتوي على روابط ترويجية مشبوهة (مثال للإخفاء).", en: "Demo comment containing spammy promo links (example for hiding)." } },
  { id: "dr-3", courseSlug: "ui-ux-design-bootcamp", author: { ar: "مراجع تجريبي ج", en: "Demo Reviewer C" }, avatar: "", rating: 3, date: "2026-10-24", text: { ar: "تعليق تجريبي: محتوى جيد لكن أحتاج أمثلة أكثر.", en: "Demo comment: good content but I need more examples." } },
];

export const demoReviewStatus: Record<string, ReviewStatus> = {
  r1: "approved", r2: "approved", r3: "approved", r4: "approved", r5: "pending", r6: "pending", r7: "approved",
  "dr-1": "pending", "dr-2": "pending", "dr-3": "pending",
};

/** Per-category demo "enrollments this month" share, used only on the overview chart. */
export const demoSiteSettings = {
  nameAr: "نيكسورا أكاديمي",
  nameEn: "NEXORA ACADEMY",
  defaultLang: "ar" as "ar" | "en",
  defaultTheme: "system" as "system" | "light" | "dark",
  supportEmail: "support@example.test",
  x: "https://x.com/example",
  linkedin: "https://www.linkedin.com/company/example",
  youtube: "https://www.youtube.com/@example",
  seoTitle: "NEXORA ACADEMY — Learn like it's cinema",
  seoDescription: "A cinematic learning platform: programming, design and AI courses with interactive learning paths.",
};

/** Demo activity feed for the overview. */
export const demoActivity: { id: string; kind: "enroll" | "review" | "publish" | "signup"; text: L; time: L }[] = [
  { id: "a1", kind: "enroll", text: { ar: "طالب تجريبي 07 سجّل في «إتقان جافاسكربت الحديثة»", en: "Demo Student 07 enrolled in “Modern JavaScript Masterclass”" }, time: { ar: "قبل 12 دقيقة", en: "12 min ago" } },
  { id: "a2", kind: "review", text: { ar: "تقييم جديد بانتظار المراجعة (5 نجوم)", en: "New review awaiting moderation (5 stars)" }, time: { ar: "قبل ساعة", en: "1 h ago" } },
  { id: "a3", kind: "signup", text: { ar: "طالب تجريبي 19 أنشأ حسابًا", en: "Demo Student 19 created an account" }, time: { ar: "قبل 3 ساعات", en: "3 h ago" } },
  { id: "a4", kind: "publish", text: { ar: "مسودة «فن السرد السينمائي» بانتظار النشر", en: "Draft “Cinematic Video Storytelling” awaits publishing" }, time: { ar: "أمس", en: "Yesterday" } },
];
