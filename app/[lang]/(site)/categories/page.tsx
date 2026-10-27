import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n";
import { pageMeta } from "@/lib/site";
import { getCategories, getCourseSummaries } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/animations/Motion";
import { CategoryCard, bentoClass } from "@/components/courses/CategoryCard";
import { ItemListJsonLd } from "@/components/courses/ItemListJsonLd";

export async function generateMetadata({ params }: PageProps<"/[lang]/categories">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = makeT(lang);
  return pageMeta({ lang, path: "/categories", title: t("categories.title"), description: t("categories.lead") });
}

export default async function CategoriesPage({ params }: PageProps<"/[lang]/categories">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = makeT(lang);
  const [categories, courses] = await Promise.all([getCategories(), getCourseSummaries()]);
  // featured categories first so the two largest tiles are the most important
  const ordered = [...categories].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const stats = (slug: string) => {
    const list = courses.filter((c) => c.category.slug === slug);
    return { courses: list.length, hours: list.reduce((s, c) => s + c.duration, 0) };
  };

  return (
    <>
      <PageHeader eyebrow={t("categories.eyebrow")} title={t("categories.title")} lead={t("categories.lead")} crumbs={[{ label: t("categories.title") }]} />
      <section className="container-x py-10 sm:py-14" aria-label={t("categories.title")}>
        <ul className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12 lg:auto-rows-[minmax(15rem,auto)]">
          {ordered.map((c, i) => (
            <li key={c.slug} className={`flex ${bentoClass(i)}`}>
              <Reveal className="flex w-full" delay={Math.min(i, 4) * 0.05}>
                <CategoryCard category={c} stats={stats(c.slug)} lang={lang} index={i} big={i === 0} className="w-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <ItemListJsonLd lang={lang} name={t("categories.title")} base="/categories" items={ordered.map((c) => ({ slug: c.slug, name: c.name[lang] }))} />
    </>
  );
}
