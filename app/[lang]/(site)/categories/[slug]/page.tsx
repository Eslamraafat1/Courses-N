import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LOCALES, isLang, nf } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCategories, getCategory, getCourseSummaries, getCoursesByCategory } from "@/lib/api";
import { facetsOf } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Link } from "@/components/ui/Link";
import { CatalogSection } from "@/components/courses/CatalogSection";
import { CategoryCard } from "@/components/courses/CategoryCard";
import { ItemListJsonLd } from "@/components/courses/ItemListJsonLd";

export async function generateStaticParams() {
  const categories = await getCategories();
  return LOCALES.flatMap((lang) => categories.map((c) => ({ lang, slug: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const cat = await getCategory(slug);
  if (!cat) return {};
  return pageMeta({
    lang,
    path: `/categories/${slug}`,
    title: `${cat.name[lang]} · ${makeT(lang)("categories.title")}`,
    description: cat.description[lang],
    image: cat.image,
  });
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/categories/[slug]">) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const t = makeT(lang);
  const f = nf(lang);
  const [courses, all, allCourses] = await Promise.all([getCoursesByCategory(cat.id), getCategories(), getCourseSummaries()]);
  const { instructors } = facetsOf(courses);
  const hours = courses.reduce((s, c) => s + c.duration, 0);
  const learners = courses.reduce((s, c) => s + c.students, 0);
  const name = cat.name[lang];

  // related = categories that share the most instructors / tags with this one, falling back to the featured ones
  const insSet = new Set(instructors.map((i) => i.slug));
  const related = all
    .filter((c) => c.id !== cat.id)
    .map((c) => ({ c, score: allCourses.filter((x) => x.category.slug === c.slug && insSet.has(x.instructor.slug)).length + (c.featured ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.c);
  const statsOf = (s: string) => {
    const list = allCourses.filter((c) => c.category.slug === s);
    return { courses: list.length, hours: list.reduce((a, c) => a + c.duration, 0) };
  };

  return (
    <>
      <section className="relative isolate overflow-hidden text-white">
        <Image src={cat.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-50 mix-blend-multiply" style={{ background: `linear-gradient(120deg, ${cat.color}, transparent 65%)` }} />
        <div className="container-x pb-12 pt-8 sm:pb-16 [&_nav]:text-white/75 [&_nav_a:hover]:text-white [&_nav_span]:text-white [&_nav_li]:text-white/75">
          <Breadcrumbs items={[{ label: t("categories.title"), href: "/categories" }, { label: name }]} />
          <div className="max-w-3xl pt-8 sm:pt-16">
            <span className="mb-5 grid size-14 place-items-center rounded-2xl backdrop-blur" style={{ background: `color-mix(in srgb, ${cat.color} 75%, black)` }}>
              <DynamicIcon name={cat.icon} className="size-7" />
            </span>
            <p className="eyebrow mb-3 !text-volt">{t("categories.detail.eyebrow")}</p>
            <h1 className="hd-1">{name}</h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">{cat.description[lang]}</p>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <li className="font-display text-2xl font-bold">{courses.length === 1 ? t("categories.courses.one") : t("categories.courses", { n: f.format(courses.length) })}</li>
              <li className="font-display text-2xl font-bold">{t("categories.hoursTotal", { n: f.format(hours) })}</li>
              <li className="font-display text-2xl font-bold">{t("categories.learners", { n: f.format(learners) })}</li>
            </ul>
          </div>
        </div>
      </section>

      {courses.length > 0 ? (
        <CatalogSection courses={courses} categories={[{ slug: cat.slug, name: cat.name, color: cat.color }]} instructors={instructors} lockedCategory={cat.slug} />
      ) : (
        <p className="container-x py-16 text-center text-muted">{t("categories.noCourses")}</p>
      )}

      <section className="container-x pb-16 sm:pb-24" aria-labelledby="related-cats">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="related-cats" className="hd-2">{t("categories.related")}</h2>
          <Link href="/categories" className="min-h-11 content-center font-semibold text-accent underline-offset-4 hover:underline">{t("categories.all")}</Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {related.map((c, i) => (
            <li key={c.slug} className="flex">
              <CategoryCard category={c} stats={statsOf(c.slug)} lang={lang} index={i + 2} className="w-full" />
            </li>
          ))}
        </ul>
      </section>
      <ItemListJsonLd lang={lang} name={t("categories.coursesIn", { name })} items={courses.map((c) => ({ slug: c.slug, name: c.title[lang] }))} />
    </>
  );
}
