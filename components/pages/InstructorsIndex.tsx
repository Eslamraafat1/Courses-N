"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { Instructor } from "@/types";
import { Link } from "@/components/ui/Link";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

/** Bento rhythm: wide feature, narrow, then thirds, then a full-width strip (repeats). */
const RHYTHM = [
  { span: "lg:col-span-7", wide: true },
  { span: "lg:col-span-5", wide: false },
  { span: "lg:col-span-4", wide: false },
  { span: "lg:col-span-4", wide: false },
  { span: "lg:col-span-4", wide: false },
  { span: "lg:col-span-12", wide: true },
] as const;

export function InstructorsIndex({ instructors, courseCounts }: { instructors: Instructor[]; courseCounts: Record<string, number> }) {
  const { t, l, n } = useI18n();
  const [skill, setSkill] = useState<string>("all");
  const skills = useMemo(() => [...new Set(instructors.flatMap((i) => i.expertise))].sort(), [instructors]);
  const shown = skill === "all" ? instructors : instructors.filter((i) => i.expertise.includes(skill));

  return (
    <div className="container-x py-10 sm:py-14">
      <div role="group" aria-label={t("instructors.filter")} className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {["all", ...skills].map((s) => {
          const on = s === skill;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setSkill(s)}
              className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors", on ? "border-ink bg-ink text-bg" : "border-line hover:border-ink")}
            >
              {s === "all" ? t("label.all") : <span className="ltr-run">{s}</span>}
            </button>
          );
        })}
      </div>
      <p className="mb-6 text-sm text-muted" role="status" aria-live="polite">{t("instructors.count", { n: n(shown.length) })}</p>

      {shown.length === 0 ? (
        <EmptyState title={t("state.noResults")} body={t("instructors.empty")} />
      ) : (
        <ul className="grid gap-5 lg:grid-cols-12">
          <AnimatePresence mode="popLayout">
            {shown.map((ins, i) => {
              const r = RHYTHM[i % RHYTHM.length];
              return (
                <motion.li
                  key={ins.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                  className={r.span}
                >
                  <article className={cn("card group relative flex h-full overflow-hidden transition-shadow hover:shadow-xl", r.wide ? "flex-col sm:flex-row" : "flex-col")}>
                    <div className={cn("relative shrink-0 overflow-hidden bg-bg2", r.wide ? "aspect-[4/3] sm:aspect-auto sm:w-2/5" : "aspect-[4/3]")}>
                      <Image src={ins.avatar} alt={l(ins.name)} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                      <p className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                        <span className="ltr-run">{ins.rating.toFixed(1)}</span>
                        <span className="font-normal text-muted"> · {t("label.students", { n: n(ins.students) })}</span>
                      </p>
                      <h2 className="font-display text-xl font-bold sm:text-2xl">
                        <Link href={`/instructors/${ins.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                          {l(ins.name)}
                        </Link>
                      </h2>
                      <p className="text-muted">{l(ins.title)}</p>
                      <ul className="flex flex-wrap gap-1.5" aria-label={t("instructors.expertise")}>
                        {ins.expertise.map((e) => (
                          <li key={e} className="ltr-run rounded-full bg-ink/8 px-2.5 py-1 text-xs font-semibold">{e}</li>
                        ))}
                      </ul>
                      <p className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-accent">
                        {t("instructors.coursesCount", { n: n(courseCounts[ins.id] ?? 0) })}
                        <ArrowRight className="size-4 rtl-flip transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
                      </p>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
