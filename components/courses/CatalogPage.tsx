import type { Lang } from "@/types";
import { getCourseSummaries } from "@/lib/api";
import { makeT } from "@/lib/i18n";
import { facetsOf, type SortKey } from "@/lib/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CatalogSection } from "./CatalogSection";
import { CourseCard } from "./CourseCard";
import { ItemListJsonLd } from "./ItemListJsonLd";

export type CatalogPreset = "all" | "featured" | "trending" | "new";

export const PRESET_PATH: Record<CatalogPreset, string> = {
  all: "/courses",
  featured: "/courses/featured",
  trending: "/courses/trending",
  new: "/courses/new",
};
const PRESET_SORT: Record<CatalogPreset, SortKey> = { all: "popular", featured: "rating", trending: "popular", new: "newest" };

export async function presetCourses(preset: CatalogPreset) {
  const all = await getCourseSummaries();
  const list =
    preset === "featured" ? all.filter((c) => c.featured)
    : preset === "trending" ? all.filter((c) => c.trending)
    : preset === "new" ? all.filter((c) => c.isNew)
    : all;
  return list.length ? list : all;
}

/** Shared server page body for /courses and /courses/{featured,trending,new}. */
export async function CatalogPage({ lang, preset }: { lang: Lang; preset: CatalogPreset }) {
  const t = makeT(lang);
  const courses = await presetCourses(preset);
  const { categories, instructors } = facetsOf(courses);
  const sort = PRESET_SORT[preset];
  const title = t(preset === "all" ? "catalog.title" : (`catalog.${preset}.title` as "catalog.featured.title"));
  const eyebrow = t(preset === "all" ? "catalog.eyebrow" : (`catalog.${preset}.eyebrow` as "catalog.featured.eyebrow"));
  const lead = t(preset === "all" ? "catalog.lead" : (`catalog.${preset}.lead` as "catalog.featured.lead"));
  const spotlight = preset === "all" ? [] : [...courses].sort((a, b) => (sort === "newest" ? b.publishedAt.localeCompare(a.publishedAt) : sort === "rating" ? b.rating - a.rating : b.students - a.students)).slice(0, 3);

  const tabs: { id: CatalogPreset; label: string }[] = [
    { id: "all", label: t("label.all") },
    { id: "featured", label: t("label.featured") },
    { id: "trending", label: t("label.trending") },
    { id: "new", label: t("label.new") },
  ];

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        crumbs={
          preset === "all"
            ? [{ label: t("catalog.title") }]
            : [{ label: t("catalog.title"), href: "/courses" }, { label: title }]
        }
        actions={<Button href="#catalog" variant="outline" size="sm">{t("catalog.jump")}</Button>}
      >
        <nav aria-label={t("catalog.title")} className="mt-8">
          <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {tabs.map((tab) => (
              <li key={tab.id} className="shrink-0">
                <Link
                  href={PRESET_PATH[tab.id]}
                  aria-current={tab.id === preset ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition",
                    tab.id === preset ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink",
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {spotlight.length > 0 && (
        <section className="container-x pt-10" aria-label={title}>
          <p className="mb-4 text-sm text-muted">{t(`catalog.${preset}.note` as "catalog.featured.note")}</p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spotlight.map((c, i) => (
              <li key={c.slug} className={cn(i === 0 && "sm:col-span-2 lg:col-span-1")}>
                <CourseCard course={c} variant="editorial" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <CatalogSection courses={courses} categories={categories} instructors={instructors} defaultSort={sort} />
      <ItemListJsonLd lang={lang} name={title} items={courses.map((c) => ({ slug: c.slug, name: c.title[lang] }))} />
    </>
  );
}
