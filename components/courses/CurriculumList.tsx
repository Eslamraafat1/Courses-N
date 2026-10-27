"use client";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Lesson, Module } from "@/types";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Primitives";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useVideo } from "@/components/video/VideoProvider";
import { useProgress } from "@/hooks/useLearning";
import { fmtMinutes } from "./format";

interface Props {
  courseSlug: string;
  modules: Module[];
  /** open every module (dedicated curriculum page) instead of only the first */
  expandAll?: boolean;
  /** poster for preview videos that have no own thumbnail */
  fallbackPoster?: string;
}

/**
 * Modules -> lessons accordion. Preview lessons open the cinematic video modal;
 * every other lesson is a real link into the player. Completed lessons show a check (local progress).
 */
export function CurriculumList({ courseSlug, modules, expandAll, fallbackPoster }: Props) {
  const { t, l, n } = useI18n();
  const video = useVideo();
  const { isDone } = useProgress();

  const row = (lesson: Lesson, index: number) => {
    const done = isDone(courseSlug, lesson.id);
    const title = l(lesson.title);
    const inner = (
      <>
        <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
          {done ? <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" /> : <Circle className="size-5 text-muted/60" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            <span className="ltr-run text-muted">{index + 1}.</span> {title}
          </span>
          {done && <span className="sr-only">{t("player.completed")}</span>}
        </span>
        {lesson.preview && <Badge tone="volt">{t("label.preview")}</Badge>}
        <span className="ltr-run shrink-0 text-xs text-muted">{fmtMinutes(t, lesson.duration)}</span>
        <PlayCircle className="size-5 shrink-0 text-accent" aria-hidden />
      </>
    );
    const cls = "flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-start text-sm transition-colors hover:bg-bg2";
    return (
      <li key={lesson.id}>
        {lesson.preview ? (
          <button
            type="button"
            className={cls}
            aria-label={t("course.previewLesson", { title })}
            onClick={() => video.open({ url: lesson.videoUrl, title, subtitle: t("label.preview"), poster: lesson.thumbnail ?? fallbackPoster })}
          >
            {inner}
          </button>
        ) : (
          <Link href={`/learn/${courseSlug}/${lesson.id}`} className={cls}>
            {inner}
          </Link>
        )}
      </li>
    );
  };

  const items: AccordionItem[] = modules.map((m, mi) => {
    const start = modules.slice(0, mi).reduce((s, x) => s + x.lessons.length, 0);
    return {
      id: m.id,
      title: (
        <span>
          <span className="ltr-run me-2 text-muted">{n(mi + 1)}.</span>
          {l(m.title)}
        </span>
      ),
      meta: (
        <span className="hidden sm:inline">
          {t("label.lessons", { n: n(m.lessons.length) })} · {fmtMinutes(t, m.lessons.reduce((s, x) => s + x.duration, 0))}
        </span>
      ),
      content: <ul className="space-y-0.5">{m.lessons.map((lesson, i) => row(lesson, start + i))}</ul>,
    };
  });

  return <Accordion items={items} multiple defaultOpen={expandAll ? modules.map((m) => m.id) : modules.slice(0, 1).map((m) => m.id)} />;
}
