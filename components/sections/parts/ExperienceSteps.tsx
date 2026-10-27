"use client";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Award, Check, FileText, Play, Search, StickyNote } from "lucide-react";
import { Counter, Reveal, SplitText } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { useGsap } from "@/hooks/useGsap";
import { useI18n } from "@/components/providers/I18nProvider";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEPS = [1, 2, 3, 4, 5] as const;

function Line({ w, className, delay = 0 }: { w: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-2 origin-left rounded-full bg-line rtl:origin-right", className)}
      style={{ width: w }}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    />
  );
}

/** Each mock element springs in with its own delay (once, when visible). */
function Pop({ delay = 0, children, className }: { delay?: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A bar that fills from the start edge to pct. */
function Fill({ pct, delay = 0.2, className }: { pct: number; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("h-full origin-left rounded-full bg-accent rtl:origin-right", className)}
      style={{ width: `${pct}%` }}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, delay, ease: [0.2, 0.8, 0.2, 1] }}
    />
  );
}

function Visual({ step }: { step: number }) {
  const { t, n } = useI18n();
  const reduce = useReducedMotion();
  const frame = "relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-[var(--shadow)] sm:p-6";
  if (step === 1)
    return (
      <div className={frame}>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-bg2 px-4 py-3 text-sm text-muted">
          <Search className="size-4" aria-hidden /> {t("home2.exp.mock.search")}
          <motion.span aria-hidden className="ms-0.5 h-4 w-0.5 bg-accent" animate={reduce ? undefined : { opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </div>
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <Pop key={i} delay={0.15 + i * 0.12} className="flex items-center gap-3">
              <span aria-hidden className={cn("size-12 shrink-0 rounded-xl", ["bg-accent/30", "bg-volt/60", "bg-coral/30"][i])} />
              <div className="flex-1 space-y-2">
                <Line w="70%" className="bg-ink/70" delay={0.3 + i * 0.12} />
                <Line w="45%" delay={0.4 + i * 0.12} />
              </div>
            </Pop>
          ))}
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className={frame}>
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-ink">
          <span className="relative grid size-14 place-items-center rounded-full bg-volt text-volt-ink">
            {!reduce && <motion.span aria-hidden className="absolute inset-0 rounded-full bg-volt" animate={{ scale: [1, 1.7], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />}
            <Play className="relative size-6" aria-hidden />
          </span>
          <span className="absolute start-3 top-3 rounded-full bg-volt px-3 py-1 text-xs font-bold text-volt-ink">{t("home2.exp.mock.preview")}</span>
          <div className="absolute inset-x-3 bottom-3 h-1.5 overflow-hidden rounded-full bg-white/20">
            <Fill pct={38} className="bg-volt" delay={0.4} />
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          <Line w="85%" delay={0.2} />
          <Line w="60%" delay={0.3} />
          <Line w="72%" delay={0.4} />
        </div>
      </div>
    );
  if (step === 3)
    return (
      <div className={frame}>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{t("home2.why.mock.lesson", { n: n(4) })}</span>
          <Counter value={42} suffix="%" className="text-muted" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <Fill pct={42} />
        </div>
        <Pop delay={0.3} className="mt-5 rounded-2xl bg-bg2 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <StickyNote className="size-4 text-accent" aria-hidden /> {t("home2.exp.mock.notes")}
          </p>
          <div className="space-y-2.5">
            <Line w="90%" delay={0.6} />
            <Line w="65%" delay={0.75} />
          </div>
        </Pop>
      </div>
    );
  if (step === 4)
    return (
      <div className={frame}>
        <p className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <FileText className="size-5 text-accent" aria-hidden /> {t("home2.exp.mock.project")}
        </p>
        <ul className="space-y-3">
          {[true, true, false].map((done, i) => (
            <li key={i} className="flex items-center gap-3">
              <span aria-hidden className={cn("relative grid size-6 shrink-0 place-items-center rounded-md border", done ? "border-transparent" : "border-line")}>
                {done && (
                  <motion.span
                    className="absolute inset-0 grid place-items-center rounded-md bg-volt text-volt-ink"
                    initial={reduce ? false : { scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.3 + i * 0.45 }}
                  >
                    <Check className="size-4" />
                  </motion.span>
                )}
              </span>
              <Line w={["80%", "60%", "70%"][i]} className={done ? "bg-ink/60" : undefined} delay={0.1 + i * 0.2} />
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className={cn(frame, "text-center")}>
      <div className="relative mx-auto grid size-24 place-items-center">
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="4" />
          <motion.circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <motion.span
          className="grid size-16 place-items-center rounded-full bg-volt text-volt-ink"
          initial={reduce ? false : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.9 }}
        >
          <Award className="size-8" aria-hidden />
        </motion.span>
      </div>
      {!reduce &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className={cn("absolute top-10 size-2 rounded-full", ["bg-accent", "bg-volt", "bg-coral"][i % 3])}
            style={{ insetInlineStart: `${20 + i * 12}%` }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: [0, 1, 0], y: [0, -26 - (i % 3) * 10, 20] }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1.1 + i * 0.05 }}
          />
        ))}
      <p className="mt-4 font-display text-xl font-bold">{t("home2.exp.mock.done")}</p>
      <p className="mt-1 text-sm text-muted">{t("home2.why.mock.sample")}</p>
      <div className="mx-auto mt-4 h-2 w-3/4 overflow-hidden rounded-full bg-line" aria-hidden>
        <Fill pct={100} delay={0.5} />
      </div>
    </div>
  );
}

export function ExperienceSteps() {
  const { t, n } = useI18n();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const last = useRef(0);

  useGsap(
    (c, { ScrollTrigger }) => {
      if (!c.desktop || !c.motion || !stage.current) return;
      const st = ScrollTrigger.create({
        trigger: stage.current,
        start: "top top+=88",
        end: () => `+=${Math.round(window.innerHeight * 0.7 * STEPS.length)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
          if (i !== last.current) {
            last.current = i;
            setActive(i);
          }
        },
      });
      return () => st.kill();
    },
    root,
    [],
  );

  const select = (i: number) => {
    last.current = i;
    setActive(i);
  };

  return (
    <div ref={root} className="container-x py-20 sm:py-28">
      <div className="max-w-3xl">
        <Reveal>
          <p id="exp-h" className="eyebrow mb-3">{t("home2.exp.eyebrow")}</p>
        </Reveal>
        <SplitText text={t("home2.exp.title")} className="hd-2" />
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg text-muted">{t("home2.exp.lead")}</p>
        </Reveal>
      </div>

      <div ref={stage} className="mt-12 grid gap-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-2 lg:items-center lg:gap-16">
        <ol className="space-y-4 lg:space-y-2">
          {STEPS.map((s, i) => {
            const isActive = active === i;
            const title = t(`home2.exp.s${s}.title` as TKey);
            const body = t(`home2.exp.s${s}.body` as TKey);
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "relative w-full overflow-hidden rounded-3xl border p-5 text-start transition-colors duration-300 sm:p-6 lg:cursor-pointer",
                    isActive ? "border-ink bg-surface lg:shadow-[var(--shadow)]" : "border-line lg:border-transparent lg:opacity-55 lg:hover:opacity-100",
                  )}
                >
                  <span className="flex items-start gap-4">
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-black transition-all duration-300", isActive ? "scale-110 bg-volt text-volt-ink" : "bg-bg2 text-muted")}>
                      <span className="ltr-run">{n(s)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-muted">{t("home2.exp.stepOf", { i: n(s), n: n(STEPS.length) })}</span>
                      <span className="font-display mt-0.5 block text-xl font-bold sm:text-2xl">{title}</span>
                      <span className="mt-1.5 block leading-relaxed text-muted">{body}</span>
                    </span>
                  </span>
                  {/* drawing progress line along the active card */}
                  <span aria-hidden className="absolute inset-x-0 bottom-0 hidden h-0.5 lg:block">
                    <motion.span
                      className="block h-full origin-left bg-accent rtl:origin-right"
                      initial={false}
                      animate={{ scaleX: isActive ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </span>
                </button>
                {/* compact visual for small screens */}
                <div className="mt-3 lg:hidden" aria-hidden>
                  <Visual step={s} />
                </div>
              </li>
            );
          })}
        </ol>

        <div className="hidden lg:block" aria-hidden>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-accent/20 via-transparent to-volt/30 blur-2xl" />
            <span className="text-outline ltr-run pointer-events-none absolute -end-6 -top-14 -z-10 select-none font-display text-[9rem] font-black leading-none opacity-40">{n(active + 1)}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97, rotate: 1.5 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -24, scale: 0.97, rotate: -1.5 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Visual step={STEPS[active]} />
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-accent rtl:origin-right"
                    initial={false}
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center lg:mt-14">
        <Button href="/courses" magnetic size="lg">
          {t("home2.exp.cta")}
        </Button>
      </div>
    </div>
  );
}
