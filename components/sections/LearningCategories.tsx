import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Lang } from "@/types";
import { makeT } from "@/lib/i18n";
import { getCategories, getCourseSummaries } from "@/lib/api";
import { SpotlightCard, Stagger, StaggerItem } from "@/components/animations/Motion";
import { FloatingShapes, TiltCard } from "@/components/animations/Fx";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "./parts/SectionHead";

// Deliberately uneven bento: [grid placement, visual treatment]. 12 columns on lg, 2 on mobile.
const plan: { span: string; mode: "image" | "tint" | "plain" | "invert" }[] = [
  { span: "col-span-2 lg:col-span-5 lg:row-span-2", mode: "image" },
  { span: "col-span-1 lg:col-span-4", mode: "tint" },
  { span: "col-span-1 lg:col-span-3", mode: "invert" },
  { span: "col-span-1 lg:col-span-4", mode: "plain" },
  { span: "col-span-1 lg:col-span-3", mode: "tint" },
  { span: "col-span-1 lg:col-span-3", mode: "plain" },
  { span: "col-span-2 lg:col-span-5", mode: "image" },
  { span: "col-span-2 lg:col-span-4", mode: "invert" },
];

export async function LearningCategories({ lang }: { lang: Lang }) {
  const t = makeT(lang);
  const [categories, courses] = await Promise.all([getCategories(), getCourseSummaries()]);
  const counts = new Map<string, number>();
  for (const c of courses) counts.set(c.category.slug, (counts.get(c.category.slug) ?? 0) + 1);

  return (
    <section id="LearningCategories" data-section="LearningCategories" data-section-label={t("home.label.categories")} aria-labelledby="cats-title" className="relative isolate overflow-x-clip">
      <FloatingShapes />
      <div className="container-x py-20 sm:py-28">
      <SectionHead
        id="cats-title"
        eyebrow={t("home.cats.eyebrow")}
        title={t("home.cats.title")}
        lead={t("home.cats.lead")}
        action={<Button href="/categories" variant="outline" iconEnd={<ArrowUpRight className="size-4 rtl-flip" aria-hidden />}>{t("nav.browseAll")}</Button>}
      />

      <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[11.5rem] lg:grid-cols-12" gap={0.07}>
        {categories.slice(0, plan.length).map((cat, i) => {
          const p = plan[i];
          const big = p.mode === "image";
          const count = counts.get(cat.slug) ?? 0;
          const dark = p.mode === "image" || p.mode === "invert";
          return (
            <StaggerItem key={cat.id} className={`${p.span} min-h-44`}>
              <TiltCard className="h-full" max={5}>
              <SpotlightCard
                className={`group h-full overflow-hidden rounded-[1.75rem] border border-line ${p.mode === "invert" ? "bg-ink text-bg" : p.mode === "plain" ? "bg-surface" : p.mode === "tint" ? "bg-bg2" : "bg-ink text-white"} shadow-[var(--shadow)]`}
              >
                {big && (
                  <>
                    <Image src={cat.image} alt="" fill sizes="(min-width:1024px) 42vw, 100vw" className="-z-10 object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                    <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </>
                )}
                <span aria-hidden className="pointer-events-none absolute -end-10 -top-10 size-36 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: cat.color }} />
                <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`grid ${big ? "size-16" : "size-12"} place-items-center rounded-2xl text-white transition duration-500 group-hover:-rotate-12 group-hover:scale-110`}
                      style={{ background: cat.color }}
                    >
                      <DynamicIcon name={cat.icon} className={big ? "size-8" : "size-6"} />
                    </span>
                    <span className={`grid size-9 place-items-center rounded-full border transition duration-300 group-hover:bg-volt group-hover:text-volt-ink group-hover:border-volt ${dark ? "border-white/30" : "border-line"}`} aria-hidden>
                      <ArrowUpRight className="size-4 rtl-flip transition group-hover:rotate-12" />
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-display font-bold leading-tight ${big ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
                      <Link href={`/categories/${cat.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-[-4px]">
                        {cat.name[lang]}
                      </Link>
                    </h3>
                    <p className={`mt-1.5 text-sm ${dark ? "text-current opacity-75" : "text-muted"} ${big ? "max-w-xs" : "line-clamp-2 hidden sm:block"}`}>{cat.description[lang]}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: dark ? undefined : cat.color }}>
                      {t("home.cats.count", { n: count })}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </Stagger>
      </div>
    </section>
  );
}
