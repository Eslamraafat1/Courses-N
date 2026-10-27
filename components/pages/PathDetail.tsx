"use client";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, CalendarClock, Check, Layers } from "lucide-react";
import type { CourseSummary, LearningPath } from "@/types";
import { useGsap } from "@/hooks/useGsap";
import { useProgress } from "@/hooks/useLearning";
import { Reveal } from "@/components/animations/Motion";
import { CourseCard } from "@/components/courses/CourseCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Badge } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import { PathProgressLine, type LessonCounts } from "./PathParts";

export function PathDetail({ path, courses, counts, others }: { path: LearningPath; courses: Record<string, CourseSummary | undefined>; counts: LessonCounts; others: LearningPath[] }) {
  const { t, l, n } = useI18n();
  const { completed } = useProgress();
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  // GSAP owns the scroll-drawn route line (scaleY scrubbed against the list).
  useGsap(
    (c, { gsap }) => {
      if (!c.motion || !list.current || !fill.current) return;
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 60%", end: "bottom 60%", scrub: true } },
      );
    },
    list,
    [path.slug],
  );

  const firstCourse = courses[path.stages[0]?.courseSlug ?? ""];
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line pt-8">
        <Image src={path.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/90 to-bg/70" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-40" style={{ background: `radial-gradient(60% 80% at 85% 0%, ${path.accent}, transparent)` }} />
        <div className="container-x pb-12 sm:pb-16">
          <Breadcrumbs items={[{ label: t("nav.paths"), href: "/paths" }, { label: l(path.title) }]} />
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge tone="volt">{t(`level.${path.level}`)}</Badge>
                <span className="inline-flex items-center gap-1.5 text-sm"><CalendarClock className="size-4" aria-hidden />{t("paths.weeks", { n: n(path.weeks) })}</span>
                <span className="inline-flex items-center gap-1.5 text-sm"><Layers className="size-4" aria-hidden />{t("paths.stages", { n: n(path.stages.length) })}</span>
              </div>
              <h1 className="hd-1">{l(path.title)}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">{l(path.description)}</p>
              {firstCourse && (
                <Button className="mt-8" size="lg" magnetic href={`/courses/${firstCourse.slug}`} iconEnd={<ArrowRight className="size-5 rtl-flip" aria-hidden />}>
                  {t("paths.startFirst")}
                </Button>
              )}
            </div>
            <div className="card p-5 lg:col-span-4">
              <PathProgressLine stages={path.stages} counts={counts} />
              <p className="mt-3 text-xs text-muted">{t("paths.progressNote")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-14 sm:py-20" aria-labelledby="route-h">
        <h2 id="route-h" className="hd-2 mb-10 sm:mb-14">{t("paths.timeline")}</h2>
        <ol ref={list} aria-label={t("paths.timelineLabel")} className="relative space-y-10 ps-12 sm:ps-16">
          <span aria-hidden className="absolute inset-y-2 start-4 w-0.5 rounded-full bg-line sm:start-6" />
          <span ref={fill} aria-hidden className="absolute inset-y-2 start-4 w-0.5 origin-top rounded-full sm:start-6" style={{ background: path.accent }} />
          {path.stages.map((s, i) => {
            const course = courses[s.courseSlug];
            const total = counts[s.courseSlug] ?? 0;
            const done = Math.min(completed(s.courseSlug).length, total);
            const status = total > 0 && done >= total ? "done" : done > 0 ? "active" : "todo";
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={s.id} className="relative">
                <span
                  aria-hidden
                  className={cn("absolute -start-12 top-1 grid size-9 place-items-center rounded-full border-2 bg-bg font-display text-sm font-bold sm:-start-16 sm:size-12 sm:text-base", status === "todo" ? "border-line text-muted" : "text-white")}
                  style={status === "todo" ? undefined : { background: path.accent, borderColor: path.accent }}
                >
                  {status === "done" ? <Check className="size-5" /> : <span className="ltr-run">{n(i + 1)}</span>}
                </span>
                <Reveal>
                  <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                    <div className="lg:col-span-5">
                      <p className="eyebrow">{t("paths.stage", { n: n(i + 1) })}</p>
                      <h3 className="mt-1 font-display text-2xl font-bold">{l(s.title)}</h3>
                      <p className="mt-2 text-muted">{l(s.description)}</p>
                      <p className="mt-3 text-sm font-semibold">
                        <span className="sr-only">{t("label.progress")}: </span>
                        {status === "done" ? t("paths.stageDone") : status === "active" ? `${t("paths.stageActive")} · ${t("label.percent", { n: n(pct) })}` : t("paths.stageTodo")}
                      </p>
                    </div>
                    <div className="lg:col-span-7">
                      {course ? (
                        <CourseCard course={course} variant="horizontal" />
                      ) : (
                        <p className="card p-5 text-muted">{t("paths.notFoundCourse")}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {others.length > 0 && (
        <section className="border-t border-line bg-bg2/50 py-14" aria-labelledby="other-h">
          <div className="container-x">
            <h2 id="other-h" className="hd-2 mb-8">{t("paths.other")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/paths/${p.slug}`} className="card group flex h-full min-h-24 items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5" style={{ borderInlineStartColor: p.accent, borderInlineStartWidth: 4 }}>
                    <span>
                      <span className="block font-display text-lg font-bold">{l(p.title)}</span>
                      <span className="text-sm text-muted">{t("paths.weeks", { n: n(p.weeks) })} · {t("paths.stages", { n: n(p.stages.length) })}</span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 rtl-flip transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
