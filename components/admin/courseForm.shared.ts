import type { Course } from "@/types";
import { demoCourseStatus, type CourseStatus } from "@/data/adminDemo";

/** Plain-string form model (numbers kept as strings so empty fields are representable and validation is explicit). */
export interface CourseFormValues {
  titleEn: string;
  titleAr: string;
  slug: string;
  subtitleEn: string;
  subtitleAr: string;
  descEn: string;
  descAr: string;
  categoryId: string;
  instructorId: string;
  level: "beginner" | "intermediate" | "advanced";
  status: CourseStatus;
  tags: string;
  thumbnail: string;
  videoUrl: string;
  price: string;
  oldPrice: string;
  duration: string;
  featured: boolean;
  trending: boolean;
  seoTitle: string;
  seoDescription: string;
}

export const emptyCourseValues = (categoryId: string, instructorId: string): CourseFormValues => ({
  titleEn: "", titleAr: "", slug: "", subtitleEn: "", subtitleAr: "", descEn: "", descAr: "",
  categoryId, instructorId, level: "beginner", status: "draft", tags: "", thumbnail: "", videoUrl: "",
  price: "0", oldPrice: "", duration: "1", featured: false, trending: false, seoTitle: "", seoDescription: "",
});

export function courseToFormValues(c: Course): CourseFormValues {
  return {
    titleEn: c.title.en, titleAr: c.title.ar, slug: c.slug,
    subtitleEn: c.subtitle.en, subtitleAr: c.subtitle.ar, descEn: c.description.en, descAr: c.description.ar,
    categoryId: c.categoryId, instructorId: c.instructorId, level: c.level, status: demoCourseStatus[c.id] ?? "published",
    tags: c.tags.join(", "), thumbnail: c.thumbnail, videoUrl: c.videoUrl,
    price: String(c.price), oldPrice: c.oldPrice ? String(c.oldPrice) : "", duration: String(c.duration),
    featured: !!c.featured, trending: !!c.trending,
    seoTitle: c.title.en, seoDescription: c.subtitle.en,
  };
}
