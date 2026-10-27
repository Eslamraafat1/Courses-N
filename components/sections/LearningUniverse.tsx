import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCategories, getPaths } from "@/lib/api";
import { SectionHead } from "./parts/SectionHead";
import { UniverseClient, type UniverseItem } from "./parts/UniverseClient";

export async function LearningUniverse({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [categories, paths] = await Promise.all([getCategories(), getPaths()]);
  const items: UniverseItem[] = [
    ...categories.map<UniverseItem>((c) => ({ id: `cat-${c.slug}`, kind: "category", label: c.name, color: c.color, href: `/categories/${c.slug}`, icon: c.icon })),
    ...paths.map<UniverseItem>((p) => ({ id: `path-${p.slug}`, kind: "path", label: p.title, color: p.accent, href: `/paths/${p.slug}` })),
  ];

  return (
    <section id="LearningUniverse" data-section="LearningUniverse" data-section-label={t("home.label.universe")} aria-labelledby="universe-title" className="container-x py-20 sm:py-28">
      <SectionHead id="universe-title" eyebrow={t("home.universe.eyebrow")} title={t("home.universe.title")} lead={t("home.universe.lead")} />
      <div className="mt-10">
        <UniverseClient items={items} />
      </div>
    </section>
  );
}
