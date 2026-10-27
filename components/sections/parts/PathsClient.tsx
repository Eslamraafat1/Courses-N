"use client";
import { useId, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import type { CourseSummary, LearningPath } from "@/types";
import { useGsap } from "@/hooks/useGsap";
import { useProgress } from "@/hooks/useLearning";
import { useI18n } from "@/components/providers/I18nProvider";
import { Link } from "@/components/ui/Link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function PathsClient({ paths, courses }: { paths: LearningPath[]; courses: CourseSummary[] }) {
  const { t, l, n } = useI18n();
  const { percent, completed, isSeed } = useProgress();
  const uid = useId();
  const [activeId, setActiveId] = useState(paths[0]?.id ?? "");
  const byslug = useMemo(() => new Map(courses.map((c) => [c.slug, c])), [courses]);
  const path = paths.find((p) => p.id === activeId) ?? paths[0];
  const tl = useRef<HTMLDivElement>(null);

  const pathPercent = (p: LearningPath) => {
    let done = 0;
    let total = 0;
    for (const s of p.stages) {
      const c = byslug.get(s.courseSlug);
      if (!c) continue;
      total += c.lessonsCount;
      done += Math.min(completed(c.slug).length, c.lessonsCount);
    }
    return total ? Math.round((done / total) * 100) : 0;
  };

  // Animated Learning Timeline (experience #6): the SVG line draws with scroll scrub, nodes light up as they are reached.
  // Default markup is the fully drawn / lit state, so reduced-motion and no-JS users see a finished timeline.
  useGsap(
    (c, { gsap, ScrollTrigger }) => {
      const el = tl.current;
      if (!el || !c.motion) return;
      const line = el.querySelector<SVGLineElement>("[data-line]");
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", el);
      if (line) {
        gsap.set(line, { strokeDashoffset: 1 });
        gsap.to(line, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 65%", end: "bottom 55%", scrub: 0.5 } });
      }
      nodes.forEach((node) => {
        node.dataset.lit = "false";
        // lit state is a data attribute; colour / scale changes are CSS transitions (no second animation lib on the same property)
        ScrollTrigger.create({ trigger: node, start: "top 62%", onEnter: () => (node.dataset.lit = "true"), onLeaveBack: () => (node.dataset.lit = "false") });
        const card = node.parentElement?.querySelector<HTMLElement>("[data-stage-card]");
        if (card) gsap.from(card, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: node, start: "top 85%", once: true } });
      });
      // tab changes alter the page height → keep later pinned sections aligned
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(raf);
        nodes.forEach((x) => delete x.dataset.lit);
      };
    },
    tl,
    [activeId],
  );

  if (!path) return null;
  const total = pathPercent(path);
  const style = { "--pc": path.accent } as CSSProperties;

  return (
    <div className="mt-12">
      <div role="tablist" aria-label={t("home.paths.tabs")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {paths.map((p) => {
          const on = p.id === path.id;
          const pct = pathPercent(p);
          return (
            <button
              key={p.id}
              role="tab"
              id={`${uid}-tab-${p.id}`}
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActiveId(p.id)}
              onKeyDown={(e) => {
                const i = paths.findIndex((x) => x.id === p.id);
                const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!dir) return;
                e.preventDefault();
                const rtl = document.dir === "rtl" ? -1 : 1;
                const next = paths[(i + dir * rtl + paths.length) % paths.length];
                setActiveId(next.id);
                document.getElementById(`${uid}-tab-${next.id}`)?.focus();
              }}
              className={cn(
                "relative flex min-h-12 items-center gap-3 rounded-2xl border px-5 py-2 text-start transition-colors",
                on ? "border-transparent text-white" : "border-line bg-surface hover:border-ink",
              )}
            >
              {on && <motion.span layoutId="path-tab" className="absolute inset-0 rounded-2xl" style={{ background: p.accent }} transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
              <span className="relative">
                <span className="block text-sm font-bold">{l(p.title)}</span>
                <span className={cn("block text-xs", on ? "text-white/80" : "text-muted")}>
                  {t("home.paths.weeks", { n: p.weeks })} · {t("label.percent", { n: pct })}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${path.id}`} className="mt-8 grid gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16" style={style}>
        {/* path summary (sticky on desktop) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10]">
              <Image src={path.image} alt="" fill sizes="(min-width:1024px) 22rem, 92vw" className="object-cover" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute inset-x-5 bottom-4 font-display text-2xl font-bold leading-tight text-white">{l(path.title)}</p>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-muted">{l(path.description)}</p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("home.paths.weeks", { n: path.weeks })}</span>
                <span>{t(`level.${path.level}`)}</span>
                <span>{t("home.paths.stages", { n: path.stages.length })}</span>
              </p>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                  <span>{t("label.progress")}</span>
                  <span className="ltr-run">{t("label.percent", { n: n(total) })}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg2" role="progressbar" aria-valuenow={total} aria-valuemin={0} aria-valuemax={100} aria-label={`${t("label.progress")} — ${l(path.title)}`}>
                  <motion.div key={path.id} className="h-full rounded-full" style={{ background: path.accent }} initial={{ width: 0 }} animate={{ width: `${total}%` }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />
                </div>
                {isSeed && <p className="mt-2 text-xs text-muted">{t("demo.notice")}</p>}
              </div>
              <Button href={`/paths/${path.slug}`} className="w-full" iconEnd={<ArrowUpRight className="size-4 rtl-flip" aria-hidden />}>
                {t("home.paths.open")}
              </Button>
            </div>
          </div>
        </aside>

        {/* timeline */}
        <div>
          <motion.div key={path.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div ref={tl} className="relative">
              <div aria-hidden className="absolute inset-y-4 start-4 w-1 -translate-x-1/2 rtl:translate-x-1/2 lg:start-1/2">
                <svg viewBox="0 0 4 100" preserveAspectRatio="none" className="size-full overflow-visible">
                  <line x1="2" y1="0" x2="2" y2="100" stroke="var(--line)" strokeWidth="3" />
                  <line data-line x1="2" y1="0" x2="2" y2="100" pathLength={1} strokeDasharray={1} strokeDashoffset={0} stroke="var(--pc)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <ol className="relative space-y-10 lg:space-y-14">
                {path.stages.map((s, i) => {
                  const c = byslug.get(s.courseSlug);
                  const pct = c ? percent(c.slug, c.lessonsCount) : 0;
                  const right = i % 2 === 1;
                  return (
                    <li key={s.id} className="relative ps-14 lg:grid lg:grid-cols-2 lg:ps-0">
                      <span
                        data-node
                        data-lit="true"
                        className="absolute start-4 top-6 z-10 grid size-9 -translate-x-1/2 place-items-center rounded-full border-2 border-line bg-surface font-display text-sm font-bold text-muted scale-90 transition-[background-color,color,border-color,box-shadow,scale] duration-500 data-[lit=true]:scale-100 data-[lit=true]:border-transparent data-[lit=true]:bg-[var(--pc)] data-[lit=true]:text-white data-[lit=true]:shadow-[0_0_0_6px_color-mix(in_srgb,var(--pc)_22%,transparent)] rtl:translate-x-1/2 lg:start-1/2"
                      >
                        {pct >= 100 ? <Check className="size-4" aria-hidden /> : <span className="ltr-run">{i + 1}</span>}
                      </span>
                      <article data-stage-card className={cn("card min-w-0 p-5 sm:p-6", right ? "lg:col-start-2 lg:ms-12" : "lg:col-start-1 lg:me-12")}>
                        <div className="flex gap-4">
                          {c && (
                            <span className="relative hidden size-20 shrink-0 overflow-hidden rounded-2xl sm:block">
                              <Image src={c.thumbnail} alt="" fill sizes="80px" className="object-cover" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted rtl:tracking-normal">{t("home.paths.stage", { n: i + 1 })}</p>
                            <h3 className="mt-1 font-display text-xl font-bold leading-snug">
                              {c ? <Link href={`/courses/${c.slug}`} className="hover:text-accent">{l(s.title)}</Link> : l(s.title)}
                            </h3>
                            <p className="mt-1 text-sm text-muted">{l(s.description)}</p>
                          </div>
                        </div>
                        {c && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span className="truncate">{l(c.title)}</span>
                              <span className="ltr-run ps-2 font-semibold text-ink">{t("label.percent", { n: n(pct) })}</span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${t("label.progress")} — ${l(c.title)}`}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: path.accent }} />
                            </div>
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
