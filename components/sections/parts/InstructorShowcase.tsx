"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { Parallax, ScrollMarquee, TiltCard } from "@/components/animations/Fx";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Instructor, L } from "@/types";

export interface InstructorCourseLite {
  slug: string;
  title: L;
}
export interface InstructorEntry {
  instructor: Instructor;
  courses: InstructorCourseLite[];
}

export function InstructorShowcase({ entries }: { entries: InstructorEntry[] }) {
  const { t, l, n, isRtl } = useI18n();
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = entries[idx];

  const move = (to: number) => {
    const next = (to + entries.length) % entries.length;
    setIdx(next);
    tabs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const fwd = isRtl ? "ArrowLeft" : "ArrowRight";
    const back = isRtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === "ArrowDown" || e.key === fwd) {
      e.preventDefault();
      move(idx + 1);
    } else if (e.key === "ArrowUp" || e.key === back) {
      e.preventDefault();
      move(idx - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(entries.length - 1);
    }
  };

  if (!cur) return null;
  const ins = cur.instructor;
  const name = l(ins.name);

  return (
    <div className="container-x relative isolate py-20 sm:py-28">
      <style>{`
        @keyframes ins-orbit { to { transform: rotate(360deg); } }
        @keyframes ins-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .ins-orbit { animation: ins-orbit 30s linear infinite; }
        .ins-bob { animation: ins-bob 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ins-orbit, .ins-bob { animation: none; } }
      `}</style>
      <ScrollMarquee rows={[name]} className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 opacity-[0.06] rtl:[&>div]:tracking-normal" />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Reveal>
            <p id="ins-h" className="eyebrow mb-3">{t("home2.ins.eyebrow")}</p>
          </Reveal>
          <SplitText text={t("home2.ins.title")} className="hd-2" />
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted">{t("home2.ins.lead")}</p>
          </Reveal>
        </div>
        <Button href="/instructors" variant="outline" iconEnd={<ArrowUpRight className="size-4 rtl-flip" aria-hidden />}>
          {t("home2.ins.all")}
        </Button>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-8">
        {/* roster */}
        <div
          role="tablist"
          aria-label={t("home2.ins.roster")}
          aria-orientation="vertical"
          onKeyDown={onKey}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {entries.map((e, i) => {
            const active = i === idx;
            return (
              <button
                key={e.instructor.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`ins-tab-${e.instructor.id}`}
                aria-selected={active}
                aria-controls="ins-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setIdx(i)}
                className={cn(
                  "relative flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border px-3 py-2 text-start transition-colors",
                  active ? "border-transparent text-bg" : "border-line bg-surface hover:border-ink",
                )}
              >
                {active && <motion.span layoutId="ins-active" className="absolute inset-0 -z-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-bg2">
                  <Image src={e.instructor.avatar} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="relative min-w-0">
                  <span className="block truncate text-sm font-bold">{l(e.instructor.name)}</span>
                  <span className={cn("block truncate text-xs", active ? "opacity-70" : "text-muted")}>{l(e.instructor.title)}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* featured */}
        <Parallax speed={2} className="min-w-0"><TiltCard max={2.5} glare={false}>
        <div id="ins-panel" role="tabpanel" aria-labelledby={`ins-tab-${ins.id}`} tabIndex={0} className="card relative h-full overflow-hidden rounded-[2rem] focus-visible:outline-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ins.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-0 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
            >
              <motion.div
                initial={reduce ? false : { clipPath: "inset(0 0 100% 0 round 1.5rem)" }}
                animate={{ clipPath: "inset(0 0 0% 0 round 0rem)" }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative aspect-[4/5] w-full md:aspect-auto md:min-h-[26rem]"
              >
                <Image src={ins.avatar} alt={name} fill sizes="(min-width:768px) 320px, 100vw" className="object-cover" priority={idx === 0} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <div aria-hidden className="ins-orbit pointer-events-none absolute -end-1/4 -top-1/4 size-3/4 rounded-full border border-dashed border-white/40">
                  <span className="absolute start-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt" />
                </div>
                <ul aria-hidden className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap gap-2">
                  {ins.expertise.slice(0, 2).map((x, k) => (
                    <motion.li
                      key={x}
                      initial={reduce ? false : { opacity: 0, scale: 0.6, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.5 + k * 0.15 }}
                    >
                      <span className="ins-bob block rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink shadow-lg backdrop-blur" style={{ animationDelay: `${k * -1.6}s` }}>
                        <span className="ltr-run">{x}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <p className="absolute inset-x-5 bottom-5 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="ltr-run">{ins.rating.toFixed(1)}</span>
                  <span className="opacity-80">· {t("home2.ins.students", { n: n(ins.students) })}</span>
                </p>
              </motion.div>

              <div className="flex flex-col p-6 sm:p-8">
                <p className="eyebrow">{l(ins.title)}</p>
                <h3 className="font-display mt-2 text-3xl font-black sm:text-4xl">{name}</h3>
                <p className="mt-4 leading-relaxed text-muted">{l(ins.bio)}</p>

                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">{t("home2.ins.expertise")}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {ins.expertise.map((x) => (
                    <li key={x} className="rounded-full border border-line bg-bg2 px-3 py-1 text-sm font-medium">
                      <span className="ltr-run">{x}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">
                  {t("home2.ins.theirCourses")} <span className="ms-1 rounded-full bg-accent px-2 py-0.5 text-accent-ink">{t("home2.ins.courses", { n: n(cur.courses.length) })}</span>
                </p>
                {cur.courses.length ? (
                  <ul className="mt-2 space-y-1">
                    {cur.courses.slice(0, 3).map((c) => (
                      <li key={c.slug}>
                        <Link href={`/courses/${c.slug}`} className="group flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-bg2">
                          <span className="min-w-0 truncate font-medium">{l(c.title)}</span>
                          <ArrowUpRight className="size-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent rtl-flip" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted">{t("home2.ins.noCourses")}</p>
                )}

                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <Button href={`/instructors/${ins.slug}`}>{t("act.viewProfile")}</Button>
                  <Button href={`/search?q=${encodeURIComponent(name)}`} variant="outline">
                    {t("home2.ins.browse")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </TiltCard></Parallax>
      </div>
    </div>
  );
}
