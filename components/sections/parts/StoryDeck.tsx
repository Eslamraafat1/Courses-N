"use client";
import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { Parallax } from "@/components/animations/Fx";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

/** Word-by-word quote: the front card writes itself in; cards behind stay static. */
function QuoteWords({ text, active, reduce }: { text: string; active: boolean; reduce: boolean | null }) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!active || reduce) return <>{text}</>;
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: "0.4em", filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: 0.12 + i * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </>
  );
}

function StoryCard({
  s,
  pos,
  total,
  index,
  reduce,
  isRtl,
  onSwipe,
}: {
  s: Testimonial;
  pos: number;
  total: number;
  index: number;
  reduce: boolean | null;
  isRtl: boolean;
  onSwipe: (info: PanInfo) => void;
}) {
  const { t, l, n } = useI18n();
  const front = pos === 0;
  const shown = pos < 3;
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-240, 0, 240], reduce ? [0, 0, 0] : [-9, 0, 9]);
  return (
    <motion.article
      aria-hidden={!front}
      inert={!front}
      aria-roledescription="slide"
      aria-label={t("home2.stories.count", { i: n(index + 1), n: n(total) })}
      drag={front && !reduce ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      dragTransition={{ bounceStiffness: 420, bounceDamping: 26 }}
      onDragEnd={front ? (_, info) => onSwipe(info) : undefined}
      animate={{
        y: pos * 20,
        scale: 1 - pos * 0.05,
        rotate: reduce ? 0 : pos * 1.6 * (isRtl ? -1 : 1),
        opacity: shown ? 1 - pos * 0.28 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
      style={{ x, zIndex: total - pos, touchAction: "pan-y" }}
      className={cn("col-start-1 row-start-1", !shown && "pointer-events-none", front && "cursor-grab active:cursor-grabbing")}
    >
      <motion.div
        style={{ rotate: tilt }}
        className={cn("card flex h-full flex-col rounded-[2rem] p-6 sm:p-9", pos === 1 && "bg-bg2", pos >= 2 && "bg-surface2")}
      >
        <Quote className="size-9 text-accent" aria-hidden />
        <blockquote className="font-display mt-4 text-xl font-bold leading-snug sm:text-2xl">
          <QuoteWords text={l(s.quote)} active={front} reduce={reduce} />
        </blockquote>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
          <div className="flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-bg2">
              <Image src={s.avatar} alt="" fill sizes="48px" className="object-cover" draggable={false} />
            </span>
            <div>
              <p className="font-bold">{l(s.name)}</p>
              <p className="text-sm text-muted">{l(s.role)}</p>
            </div>
          </div>
          <p className="rounded-full bg-volt px-3.5 py-1.5 text-sm font-bold text-volt-ink">
            <span className="sr-only">{t("home2.stories.outcome")}: </span>
            {l(s.outcome)}
          </p>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function StoryDeck({ stories }: { stories: Testimonial[] }) {
  const { t, l, n, isRtl } = useI18n();
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const total = stories.length;
  const go = (to: number) => setIdx(((to % total) + total) % total);
  const dir = isRtl ? -1 : 1;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(idx + dir);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(idx - dir);
    }
  };
  // Swipe by distance OR flick velocity; dragging toward the reading-start side advances.
  const onSwipe = (info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.25;
    if (Math.abs(power) < 70) return;
    go(idx + (power < 0 ? dir : -dir));
  };

  if (!total) return null;
  const cur = stories[idx];

  return (
    <div className="container-x relative isolate py-20 sm:py-28">
      <Parallax speed={10} className="pointer-events-none absolute -end-4 top-10 -z-10 select-none" >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={idx}
            aria-hidden
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="ltr-run text-outline block font-display text-[clamp(7rem,22vw,18rem)] font-black leading-none opacity-30"
          >
            {n(idx + 1)}
          </motion.span>
        </AnimatePresence>
      </Parallax>

      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <Reveal>
            <p id="stories-h" className="eyebrow mb-3">{t("home2.stories.eyebrow")}</p>
          </Reveal>
          <SplitText text={t("home2.stories.title")} className="hd-2" />
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted">{t("home2.stories.lead")}</p>
            <p className="mt-5 inline-block rounded-2xl border border-dashed border-coral/60 bg-coral/5 px-4 py-2.5 text-sm">{t("home2.stories.demo")}</p>
          </Reveal>

          <div className="mt-8 flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => go(idx - 1)}
              aria-label={t("act.prev")}
              className="grid size-12 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-ink hover:bg-ink hover:text-bg"
            >
              <ChevronLeft className="size-5 rtl-flip" aria-hidden />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => go(idx + 1)}
              aria-label={t("act.next")}
              className="grid size-12 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-ink hover:bg-ink hover:text-bg"
            >
              <ChevronRight className="size-5 rtl-flip" aria-hidden />
            </motion.button>
            <p className="ms-2 text-sm text-muted">
              <span className="ltr-run font-semibold text-ink">{n(idx + 1)}</span> / <span className="ltr-run">{n(total)}</span>
            </p>
          </div>
          {/* progress pips */}
          <div aria-hidden className="mt-4 flex max-w-xs gap-1.5">
            {stories.map((s, i) => (
              <motion.span key={s.id} animate={{ flexGrow: i === idx ? 3 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className={cn("h-1.5 basis-0 rounded-full transition-colors duration-300", i === idx ? "bg-accent" : "bg-line")} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{t("home2.stories.hint")}</p>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={t("home2.stories.group")}
          tabIndex={0}
          onKeyDown={onKey}
          className="rounded-[2rem] pb-10 outline-offset-8"
        >
          <div className="grid">
            {stories.map((s, i) => (
              <StoryCard key={s.id} s={s} pos={(i - idx + total) % total} total={total} index={i} reduce={reduce} isRtl={isRtl} onSwipe={onSwipe} />
            ))}
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {t("home2.stories.count", { i: n(idx + 1), n: n(total) })}: {l(cur.name)}. {l(cur.quote)}
          </p>
        </div>
      </div>
    </div>
  );
}
