"use client";
import { useProgress } from "@/hooks/useLearning";
import { useI18n } from "@/components/providers/I18nProvider";
import type { PathStage } from "@/types";
import { cn } from "@/lib/utils";

export type LessonCounts = Record<string, number>;

/** Aggregate lesson progress of a path from the local progress store. */
export function usePathProgress(stages: PathStage[], counts: LessonCounts) {
  const { completed } = useProgress();
  const total = stages.reduce((s, st) => s + (counts[st.courseSlug] ?? 0), 0);
  const done = stages.reduce((s, st) => s + Math.min(completed(st.courseSlug).length, counts[st.courseSlug] ?? 0), 0);
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
}

export function ProgressBar({ percent, label, className }: { percent: number; label: string; className?: string }) {
  return (
    <div className={className}>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function PathProgressLine({ stages, counts, className }: { stages: PathStage[]; counts: LessonCounts; className?: string }) {
  const { t, n } = useI18n();
  const { done, total, percent } = usePathProgress(stages, counts);
  return (
    <div className={cn("space-y-2", className)}>
      <ProgressBar percent={percent} label={t("paths.overall")} />
      <p className="text-sm text-muted">{t("paths.lessonsDone", { done: n(done), total: n(total) })}</p>
    </div>
  );
}
