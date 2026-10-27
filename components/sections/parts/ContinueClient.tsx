"use client";
import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import type { CourseSummary } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { useLastLesson, useProgress } from "@/hooks/useLearning";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Badge, EmptyState } from "@/components/ui/Primitives";

export type ContinueCourse = CourseSummary & { lessonIds: string[] };

function Ring({ value, size = 96, label }: { value: number; size?: number; label: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 rtl:rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={6} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--volt)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: circ * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <span className="absolute font-display text-xl font-bold ltr-run">{value}%</span>
    </div>
  );
}

export function ContinueClient({ courses }: { courses: ContinueCourse[] }) {
  const { t, l, n } = useI18n();
  const { map, isSeed, percent } = useProgress();
  const last = useLastLesson();

  const items = useMemo(() => {
    return courses
      .filter((c) => (map[c.slug]?.length ?? 0) > 0)
      .map((c) => {
        const done = new Set(map[c.slug]);
        const saved = last.map[c.slug];
        const resume = saved && c.lessonIds.includes(saved) ? saved : (c.lessonIds.find((id) => !done.has(id)) ?? c.lessonIds[0] ?? c.firstLessonId);
        return { c, pct: percent(c.slug, c.lessonIds.length), resume, doneCount: Math.min(done.size, c.lessonIds.length) };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [courses, map, last.map, percent]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BookOpenCheck className="size-7" aria-hidden />}
        title={t("home.continue.emptyTitle")}
        body={t("home.continue.emptyBody")}
        action={<Button href="/courses">{t("act.startLearning")}</Button>}
      />
    );
  }

  const [lead, ...rest] = items;
  return (
    <div>
      {isSeed && (
        <p className="mb-5">
          <Badge tone="neutral">{t("demo.notice")}</Badge>
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* the course you were in the middle of */}
        <article className="relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-8">
          <Image src={lead.c.thumbnail} alt="" fill sizes="(min-width:1024px) 55vw, 100vw" className="-z-10 object-cover opacity-60" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 max-w-md">
              <p className="text-xs font-bold uppercase tracking-widest text-volt rtl:tracking-normal">{t("home.continue.resume")}</p>
              <h3 className="mt-2 font-display text-3xl font-bold leading-tight">{l(lead.c.title)}</h3>
              <p className="mt-2 text-sm text-white/75">{t("home.continue.done", { a: n(lead.doneCount), b: n(lead.c.lessonIds.length) })}</p>
              <Button href={`/learn/${lead.c.slug}/${lead.resume}`} variant="primary" size="lg" magnetic className="mt-5" iconEnd={<ArrowRight className="size-5 rtl-flip" aria-hidden />}>
                {t("act.continue")}
              </Button>
            </div>
            <Ring value={lead.pct} size={112} label={t("label.percent", { n: lead.pct })} />
          </div>
        </article>

        <ul className="flex flex-col gap-3">
          {rest.map(({ c, pct, resume }) => (
            <li key={c.slug} className="card flex items-center gap-4 p-3 pe-4">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
                <Image src={c.thumbnail} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 font-display text-base font-bold">{l(c.title)}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${t("label.progress")} — ${l(c.title)}`}>
                    <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />
                  </div>
                  <span className="ltr-run text-xs font-semibold text-muted">{t("label.percent", { n: pct })}</span>
                </div>
              </div>
              <Link href={`/learn/${c.slug}/${resume}`} aria-label={`${t("act.continue")}: ${l(c.title)}`} className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-bold text-bg transition hover:bg-accent hover:text-accent-ink">
                {t("act.continue")}
              </Link>
            </li>
          ))}
          {rest.length === 0 && (
            <li className="grid flex-1 place-items-center rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">{t("home.continue.more")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
