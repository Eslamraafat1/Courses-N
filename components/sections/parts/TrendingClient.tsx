"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CourseSummary, L } from "@/types";
import { CourseCard, type CourseCardVariant } from "@/components/courses/CourseCard";
import { TiltCard } from "@/components/animations/Fx";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

export interface TrendingCat {
  slug: string;
  name: L;
  color: string;
}

// Rhythm of shapes; cycles so any filtered list still looks composed. span = columns on lg (3-col grid, dense flow).
const rhythm: { v: CourseCardVariant; span: string }[] = [
  { v: "wide", span: "md:col-span-2" },
  { v: "grid", span: "" },
  { v: "editorial", span: "" },
  { v: "horizontal", span: "md:col-span-2" },
  { v: "grid", span: "" },
];

export function TrendingClient({ courses, cats }: { courses: CourseSummary[]; cats: TrendingCat[] }) {
  const { t, l, n } = useI18n();
  const [active, setActive] = useState<string>("all");
  const list = useMemo(() => (active === "all" ? courses : courses.filter((c) => c.category.slug === active)), [courses, active]);

  const chip = (slug: string, label: string, color?: string) => {
    const on = active === slug;
    return (
      <button
        key={slug}
        type="button"
        aria-pressed={on}
        onClick={() => setActive(slug)}
        className={cn(
          "relative inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
          on ? "border-transparent text-volt-ink" : "border-line bg-surface text-ink hover:border-ink",
        )}
      >
        {on && <motion.span layoutId="trend-chip" className="absolute inset-0 rounded-full bg-volt" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
        <span className="relative flex items-center gap-2">
          {color && <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />}
          {label}
        </span>
      </button>
    );
  };

  return (
    <div>
      <div role="group" aria-label={t("home.trending.filter")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {chip("all", t("label.all"))}
        {cats.map((c) => chip(c.slug, l(c.name), c.color))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{t("label.results", { n: n(list.length) })}</p>

      <motion.div layout className="mt-8 grid grid-flow-dense gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((c, i) => {
            const r = rhythm[i % rhythm.length];
            return (
              <motion.div
                key={c.slug}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn("min-w-0", r.span)}
              >
                <TiltCard className="h-full" max={4} glare={false}><CourseCard course={c} variant={r.v} className="h-full" /></TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
