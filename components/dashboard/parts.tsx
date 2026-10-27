"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FlaskConical, Play } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { cn } from "@/lib/utils";
import type { StudentCourse } from "./useStudentCourses";

/** Small pill that marks content as sample data. */
export function DemoBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1 text-xs font-semibold text-muted", className)}>
      <FlaskConical className="size-3.5" aria-hidden />
      {t("demo.notice")}
    </span>
  );
}

export function SeedNote() {
  const { t } = useI18n();
  return (
    <p role="note" className="rounded-2xl border border-dashed border-line bg-bg2/60 px-4 py-3 text-sm text-muted">
      {t("dash.seed")}
    </p>
  );
}

export function ProgressBar({ value, label, className, tone = "accent" }: { value: number; label: string; className?: string; tone?: "accent" | "volt" }) {
  const reduce = useReducedMotion();
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/10", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", tone === "volt" ? "bg-volt" : "bg-accent")}
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        style={reduce ? { width: `${value}%` } : undefined}
      />
    </div>
  );
}

/** Course in progress, three shapes: `feature` (big, cinematic), `row` (dense), `tile` (vertical). */
export function ProgressCourse({ item, variant = "row", className }: { item: StudentCourse; variant?: "feature" | "row" | "tile"; className?: string }) {
  const { t, l, n } = useI18n();
  const { course: c } = item;
  const title = l(c.title);
  const label = t("dash.continue.percent", { n: n(item.pct) });
  const actionLabel = item.completed ? t("dash.learning.open") : t("dash.continue.resume");
  const href = item.completed ? `/courses/${c.slug}` : item.resumeHref;

  if (variant === "feature") {
    return (
      <article className={cn("group relative isolate overflow-hidden rounded-[2rem] bg-ink text-bg", className)}>
        <Image src={c.thumbnail} alt="" fill sizes="(min-width:1280px) 50vw, 100vw" className="-z-10 object-cover opacity-55 transition duration-700 group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="flex min-h-[20rem] flex-col justify-end gap-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-volt rtl:tracking-normal">{l(c.category.name)}</p>
          <h3 className="font-display text-2xl font-bold leading-tight sm:text-4xl">{title}</h3>
          <div className="max-w-lg">
            <div className="mb-2 flex justify-between text-sm text-bg/80">
              <span>{t("dash.continue.lessonsDone", { done: n(item.done), total: n(item.total) })}</span>
              <span className="ltr-run font-semibold">{label}</span>
            </div>
            <ProgressBar value={item.pct} label={label} tone="volt" className="bg-bg/20" />
          </div>
          <div>
            <Link href={href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-volt px-6 font-bold text-volt-ink hover:brightness-95">
              <Play className="size-4" fill="currentColor" aria-hidden />
              {actionLabel}
              <span className="sr-only"> — {title}</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "tile") {
    return (
      <article className={cn("card flex flex-col overflow-hidden", className)}>
        <div className="relative aspect-[16/9]">
          <Image src={c.thumbnail} alt="" fill sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 90vw" className="object-cover" />
          <span className="absolute end-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-bold text-bg ltr-run">{item.pct}%</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">
            <Link href={`/courses/${c.slug}`} className="hover:text-accent">{title}</Link>
          </h3>
          <ProgressBar value={item.pct} label={label} />
          <p className="text-xs text-muted">{t("dash.continue.lessonsDone", { done: n(item.done), total: n(item.total) })}</p>
          <Link href={href} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-bg hover:bg-accent hover:text-accent-ink">
            {actionLabel}
            <ArrowRight className="size-4 rtl-flip" aria-hidden />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("card flex items-center gap-4 p-3 sm:p-4", className)}>
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl sm:size-20">
        <Image src={c.thumbnail} alt="" fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 font-display text-base font-bold">
          <Link href={`/courses/${c.slug}`} className="hover:text-accent">{title}</Link>
        </h3>
        <div className="mt-2 flex items-center gap-3">
          <ProgressBar value={item.pct} label={label} className="flex-1" />
          <span className="text-xs font-semibold ltr-run">{item.pct}%</span>
        </div>
      </div>
      <Link href={href} aria-label={`${actionLabel}: ${title}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-bg hover:bg-accent hover:text-accent-ink">
        <Play className="size-4" fill="currentColor" aria-hidden />
      </Link>
    </article>
  );
}
