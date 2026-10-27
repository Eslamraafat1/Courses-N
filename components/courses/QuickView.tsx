"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, Layers, Play, X } from "lucide-react";
import type { CourseSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge, Rating } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { useVideo } from "@/components/video/VideoProvider";
import { PriceTag, ShareButtons, WishlistButton } from "./CourseParts";
import { lockScroll, unlockScroll } from "@/lib/scroll";

export const thumbLayoutId = (slug: string) => `course-thumb-${slug}`;

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const noopSubscribe = () => () => {};

interface Props {
  course: CourseSummary | null;
  onClose: () => void;
}

/**
 * Experience #8 — Cinematic Course Transition.
 * The card thumbnail shares a Framer Motion layoutId with the hero image here, so it visually grows out of the card.
 * Accessible custom dialog: role=dialog + aria-modal, focus trap, Esc / backdrop / button to close, focus restored, scroll locked.
 */
export function QuickView({ course, onClose }: Props) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{course && <Panel key={course.slug} course={course} onClose={onClose} />}</AnimatePresence>, document.body);
}

function Panel({ course: c, onClose }: { course: CourseSummary; onClose: () => void }) {
  const { t, l, n } = useI18n();
  const video = useVideo();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const title = l(c.title);
  const titleId = `qv-title-${c.slug}`;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lockScroll();
    closeRef.current?.focus();
    return () => {
      unlockScroll();
      // return focus to the thumbnail that opened us (it is still mounted in the catalog)
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes || !nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const dur = reduce ? 0 : 0.45;
  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.25 }}
      data-lenis-prevent
    >
      <div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("catalog.quick.label", { title })}
        aria-describedby={`${titleId}-d`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        initial={reduce ? false : { y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={reduce ? undefined : { y: 16, scale: 0.98, opacity: 0 }}
        transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid max-h-[94dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface text-ink shadow-[var(--shadow)] outline-none md:grid-cols-[1.1fr_1fr] md:overflow-hidden"
      >
        <div className="relative min-h-60 md:min-h-[30rem]">
          <motion.div
            layoutId={reduce ? undefined : thumbLayoutId(c.slug)}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-hidden"
          >
            <Image src={c.thumbnail} alt="" fill priority sizes="(min-width:768px) 560px, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
          <div className="absolute inset-x-4 top-4 flex flex-wrap gap-1.5">
            {c.isNew && <Badge tone="volt">{t("label.new")}</Badge>}
            {c.trending && <Badge tone="coral">{t("label.trending")}</Badge>}
            {c.price === 0 && <Badge tone="accent">{t("label.free")}</Badge>}
          </div>
          <button
            type="button"
            onClick={() => video.open({ url: c.videoUrl, title, subtitle: `${t("label.by")} ${l(c.instructor.name)}`, poster: c.thumbnail })}
            className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-volt text-volt-ink shadow-xl transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={t("catalog.quick.preview")}
          >
            <Play className="size-7 translate-x-0.5" fill="currentColor" aria-hidden />
          </button>
        </div>

        <motion.div
          className="flex min-w-0 flex-col gap-4 p-6 sm:p-8 md:max-h-[94dvh] md:overflow-y-auto"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.18, duration: reduce ? 0 : 0.4 }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("catalog.quick.close")}
            className="absolute end-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
          >
            <X className="size-5" aria-hidden />
          </button>
          <p className="pe-12 text-xs font-bold uppercase tracking-widest rtl:tracking-normal" style={{ color: c.category.color }}>{l(c.category.name)}</p>
          <h2 id={titleId} className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
          <p id={`${titleId}-d`} className="text-muted">{l(c.description)}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("label.hours", { n: c.duration })}</span>
            <span className="inline-flex items-center gap-1"><Layers className="size-4" aria-hidden />{t("label.lessons", { n: c.lessonsCount })}</span>
            <span>{t(`level.${c.level}`)}</span>
            <span>{t("catalog.quick.students", { n: n(c.students) })}</span>
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="relative size-9 overflow-hidden rounded-full bg-bg2"><Image src={c.instructor.avatar} alt="" fill sizes="36px" className="object-cover" /></span>
            <span>
              <span className="block text-xs text-muted">{t("catalog.quick.instructor")}</span>
              <span className="font-semibold">{l(c.instructor.name)}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <Rating value={c.rating} count={c.reviewsCount} />
            <PriceTag price={c.price} oldPrice={c.oldPrice} />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <Button href={`/courses/${c.slug}`} variant="primary">{t("catalog.quick.open")}</Button>
            <WishlistButton slug={c.slug} variant="button" />
          </div>
          <ShareButtons path={`/courses/${c.slug}`} title={title} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
