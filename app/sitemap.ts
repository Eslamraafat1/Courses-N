import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";
import { getCategories, getCourses, getInstructors, getPaths, getPosts } from "@/lib/api";

/** Public, indexable pages only. Excludes /admin, auth, dashboard-like and other private pages. */
const STATIC_ROUTES = [
  "/", "/courses", "/courses/featured", "/courses/trending", "/courses/new", "/categories", "/paths", "/instructors",
  "/about", "/contact", "/faq", "/pricing", "/blog", "/help", "/privacy", "/terms",
  "/become-instructor", "/success-stories", "/accessibility",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, categories, paths, instructors, posts] = await Promise.all([getCourses(), getCategories(), getPaths(), getInstructors(), getPosts()]);
  const dynamic = [
    ...courses.map((c) => `/courses/${c.slug}`),
    ...categories.map((c) => `/categories/${c.slug}`),
    ...paths.map((p) => `/paths/${p.slug}`),
    ...instructors.map((i) => `/instructors/${i.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  const url = (lang: string, path: string) => `${SITE_URL}/${lang}${path === "/" ? "" : path}`;
  return [...STATIC_ROUTES, ...dynamic].flatMap((path) =>
    LOCALES.map((lang) => ({
      url: url(lang, path),
      changeFrequency: path === "/" || path === "/blog" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : STATIC_ROUTES.includes(path) ? 0.7 : 0.6,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, url(l, path)])) },
    })),
  );
}
