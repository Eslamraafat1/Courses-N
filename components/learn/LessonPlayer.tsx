"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, HardDrive, ListVideo, PanelRightClose, PanelRightOpen, RotateCcw, X } from "lucide-react";
import type { Course } from "@/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { VideoEmbed } from "@/components/video/VideoEmbed";
import { useLastLesson, usePrefs, useProgress } from "@/hooks/useLearning";
import { readStore } from "@/lib/store";
import { posterFor } from "@/lib/video";
import { cn } from "@/lib/utils";
import { fmtMinutes, lessonsOf } from "@/components/courses/format";
import { LessonSidebar } from "./LessonSidebar";
import { NotesPanel, QaPanel, RelatedLessons, ResourceList } from "./LessonPanels";

const NO_LAST: Record<string, string> = {};

function ProgressBar({ pct, done, total }: { pct: number; done: number; total: number }) {
  const { t, n } = useI18n();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{t("label.progress")}</span>
        <span className="ltr-run text-muted">
          {n(done)}/{n(total)} · {t("label.percent", { n: pct })}
        </span>
      </div>
      <div role="progressbar" aria-label={t("label.progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={t("label.percent", { n: pct })} className="h-2.5 overflow-hidden rounded-full bg-bg2">
        <div className="h-full rounded-full bg-volt transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
        <HardDrive className="size-3.5" aria-hidden /> {t("player.savedLocally")}
      </p>
    </div>
  );
}

const isTyping = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
};

/** The whole lesson experience: inline player, outline (sidebar / drawer), progress, notes, Q&A and shortcuts. */
export function LessonPlayer({ course, lessonId }: { course: Course; lessonId: string }) {
  const { t, l, n, h } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const progress = useProgress();
  const lastLesson = useLastLesson();
  const { prefs, update } = usePrefs();

  const lessons = useMemo(() => lessonsOf(course), [course]);
  const index = lessons.findIndex((x) => x.id === lessonId);
  const lesson = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const slug = course.slug;

  const [sidebar, setSidebar] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [resumeFrom, setResumeFrom] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const bannerChecked = useRef(false);

  const done = progress.completed(slug).filter((id) => lessons.some((x) => x.id === id)).length;
  const pct = progress.percent(slug, lessons.length);
  const isDone = lesson ? progress.isDone(slug, lesson.id) : false;
  const { set: rememberLesson } = lastLesson;

  // remember where the learner is; on the first open show a "resume" banner when they were somewhere else before
  useEffect(() => {
    if (!lesson) return;
    let timer: number | undefined;
    if (!bannerChecked.current) {
      bannerChecked.current = true;
      const before = readStore<Record<string, string>>("nx-last-lesson", NO_LAST)[slug];
      if (before && before !== lesson.id && lessons.some((x) => x.id === before)) {
        timer = window.setTimeout(() => setResumeFrom(before), 0);
      }
    }
    rememberLesson(slug, lesson.id);
    return () => window.clearTimeout(timer);
  }, [slug, lesson, lessons, rememberLesson]);

  // move focus to the lesson title after in-app navigation (not on the very first render)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [lessonId]);

  const go = useCallback(
    (target: { id: string } | undefined, auto = false) => {
      if (!target) return;
      setAutoStart(auto);
      router.push(h(`/learn/${slug}/${target.id}`));
    },
    [router, h, slug],
  );

  const toggleDone = useCallback(() => {
    if (!lesson) return;
    const nowDone = progress.toggleLesson(slug, lesson.id);
    toast.success(nowDone ? t("player.markedDone") : t("player.markedUndone"));
  }, [lesson, progress, slug, toast, t]);

  const onEnded = () => {
    if (!prefs.autoplay || !lesson) return;
    if (!isDone) progress.toggleLesson(slug, lesson.id);
    if (next) {
      toast.info(t("player.autoNext", { title: l(next.title) }));
      go(next, true);
    }
  };

  // keyboard shortcuts: N / P / M / S (never while typing, never with modifiers)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || isTyping(e.target)) return;
      switch (e.key.toLowerCase()) {
        case "n":
          go(next);
          break;
        case "p":
          go(prev);
          break;
        case "m":
          toggleDone();
          break;
        case "s":
          setSidebar((v) => !v);
          break;
        default:
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, prev, toggleDone]);

  if (!lesson) return null;

  const mod = course.modules.find((m) => m.lessons.some((x) => x.id === lesson.id));
  const related = (mod?.lessons ?? []).filter((x) => x.id !== lesson.id).slice(0, 6);
  const resumeLesson = resumeFrom ? lessons.find((x) => x.id === resumeFrom) : undefined;
  const title = l(lesson.title);
  const poster = posterFor(lesson.thumbnail, lesson.videoUrl) ?? course.thumbnail;

  const tabs = [
    {
      id: "overview",
      label: t("player.tab.overview"),
      panel: (
        <div className="space-y-8">
          <p className="max-w-3xl text-pretty text-lg leading-relaxed text-muted">{l(lesson.description)}</p>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">{t("player.resources")}</h3>
            <ResourceList resources={lesson.resources ?? []} />
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">{t("player.related")}</h3>
            <RelatedLessons courseSlug={slug} lessons={related} />
          </div>
        </div>
      ),
    },
    { id: "notes", label: t("player.tab.notes"), panel: <NotesPanel lessonId={lesson.id} /> },
    { id: "qa", label: t("player.tab.qa"), panel: <QaPanel /> },
  ];

  const sidebarHead = (
    <div className="space-y-4 border-b border-line p-5">
      <Link href={`/courses/${slug}`} className="block font-display text-lg font-bold leading-snug hover:underline">
        {l(course.title)}
      </Link>
      <ProgressBar pct={pct} done={done} total={lessons.length} />
    </div>
  );

  return (
    <div className="container-x pb-16 pt-6">
      <Breadcrumbs
        items={[
          { label: t("nav.courses"), href: "/courses" },
          { label: l(course.title), href: `/courses/${slug}` },
          { label: title },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {mod ? l(mod.title) : ""} · <span className="ltr-run">{n(index + 1)}/{n(lessons.length)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)} icon={<ListVideo className="size-4" aria-hidden />} aria-haspopup="dialog">
            {t("player.lessons")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={() => setSidebar((v) => !v)}
            aria-expanded={sidebar}
            aria-controls="lesson-sidebar"
            icon={sidebar ? <PanelRightClose className="size-4 rtl-flip" aria-hidden /> : <PanelRightOpen className="size-4 rtl-flip" aria-hidden />}
          >
            {sidebar ? t("player.hideSidebar") : t("player.showSidebar")}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {resumeLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="region"
            aria-label={t("player.resumeTitle")}
            className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/30 bg-accent/8 p-4 text-sm"
          >
            <RotateCcw className="size-5 shrink-0 text-accent" aria-hidden />
            <p className="min-w-0 flex-1">
              <span className="font-semibold">{t("player.resumeTitle")}</span>{" "}
              <span className="text-muted">{t("player.resumeBody", { title: l(resumeLesson.title) })}</span>
            </p>
            <Button size="sm" href={`/learn/${slug}/${resumeLesson.id}`}>
              {t("act.continue")}
            </Button>
            <button type="button" onClick={() => setResumeFrom(null)} aria-label={t("act.close")} className="grid size-11 place-items-center rounded-full hover:bg-ink/8">
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("grid gap-6", sidebar ? "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]" : "lg:grid-cols-1")}>
        <motion.div key={lesson.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-[var(--shadow)] sm:rounded-3xl">
            <VideoEmbed url={lesson.videoUrl} title={title} poster={poster} autoPlay={autoStart} onEnded={onEnded} />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-extrabold leading-tight outline-none sm:text-3xl">
                {title}
              </h1>
              <p className="ltr-run mt-1 text-sm text-muted">{fmtMinutes(t, lesson.duration)}</p>
            </div>
            <Button
              variant={isDone ? "outline" : "primary"}
              onClick={toggleDone}
              aria-pressed={isDone}
              icon={<Check className="size-4" aria-hidden />}
            >
              {isDone ? t("player.completed") : t("player.markComplete")}
            </Button>
          </div>

          <ProgressBar pct={pct} done={done} total={lessons.length} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {prev ? (
              <Button variant="outline" href={`/learn/${slug}/${prev.id}`} icon={<ChevronLeft className="size-4 rtl-flip" aria-hidden />}>
                {t("act.prev")}
              </Button>
            ) : (
              <Button variant="outline" disabled icon={<ChevronLeft className="size-4 rtl-flip" aria-hidden />}>
                {t("act.prev")}
              </Button>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={prefs.autoplay}
              onClick={() => update({ autoplay: !prefs.autoplay })}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-full px-3 text-sm"
            >
              <span className={cn("relative h-6 w-10 rounded-full transition-colors", prefs.autoplay ? "bg-accent" : "bg-ink/20")} aria-hidden>
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start]", prefs.autoplay ? "start-[1.125rem]" : "start-0.5")} />
              </span>
              {t("player.autoAdvance")}
            </button>
            {next ? (
              <Button variant="dark" href={`/learn/${slug}/${next.id}`} iconEnd={<ChevronRight className="size-4 rtl-flip" aria-hidden />}>
                {t("act.next")}
              </Button>
            ) : (
              <Button variant="dark" href={`/courses/${slug}/certificate`}>
                {t("player.finish")}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted">{t("player.autoAdvanceHint")}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="font-semibold">{t("player.shortcuts")}</span>
            <span><kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">N</kbd> {t("act.next")}</span>
            <span><kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">P</kbd> {t("act.prev")}</span>
            <span><kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">M</kbd> {t("player.markComplete")}</span>
            <span><kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">S</kbd> {t("player.toggleSidebar")}</span>
          </p>

          <Tabs items={tabs} label={t("player.tabs")} />
        </motion.div>

        {sidebar && (
          <aside id="lesson-sidebar" aria-label={t("player.outline")} className="card sticky top-20 hidden max-h-[calc(100dvh-6rem)] self-start overflow-y-auto lg:block">
            {sidebarHead}
            <LessonSidebar course={course} currentId={lesson.id} />
          </aside>
        )}
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} label={t("player.outline")} variant="end">
        <div className="max-h-dvh overflow-y-auto">
          <div className="pe-12">{sidebarHead}</div>
          <LessonSidebar course={course} currentId={lesson.id} onNavigate={() => setDrawer(false)} />
        </div>
      </Modal>
    </div>
  );
}
