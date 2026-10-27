"use client";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { Course } from "@/types";
import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useProgress } from "@/hooks/useLearning";
import { cn } from "@/lib/utils";
import { fmtMinutes } from "@/components/courses/format";

/** Course outline for the player: collapsible modules, current lesson marked with aria-current, completed checks. */
export function LessonSidebar({ course, currentId, onNavigate }: { course: Course; currentId: string; onNavigate?: () => void }) {
  const { t, l, n } = useI18n();
  const { isDone } = useProgress();
  const currentModule = course.modules.find((m) => m.lessons.some((x) => x.id === currentId))?.id;

  const items: AccordionItem[] = course.modules.map((m, mi) => {
    const doneCount = m.lessons.filter((x) => isDone(course.slug, x.id)).length;
    return {
      id: m.id,
      title: (
        <span className="block text-sm">
          <span className="ltr-run me-1.5 text-muted">{n(mi + 1)}.</span>
          {l(m.title)}
        </span>
      ),
      meta: (
        <span className="ltr-run text-xs">
          {n(doneCount)}/{n(m.lessons.length)}
        </span>
      ),
      content: (
        <ul className="-mx-2 space-y-0.5">
          {m.lessons.map((lesson) => {
            const current = lesson.id === currentId;
            const done = isDone(course.slug, lesson.id);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/learn/${course.slug}/${lesson.id}`}
                  aria-current={current ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors",
                    current ? "bg-accent/12 font-semibold text-ink ring-1 ring-accent/40" : "text-ink/85 hover:bg-bg2",
                  )}
                >
                  <span className="grid size-6 shrink-0 place-items-center" aria-hidden>
                    {current ? (
                      <PlayCircle className="size-5 text-accent" />
                    ) : done ? (
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="size-5 text-muted/60" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-pretty leading-snug">{l(lesson.title)}</span>
                    <span className="ltr-run text-xs font-normal text-muted">{fmtMinutes(t, lesson.duration)}</span>
                  </span>
                  {done && <span className="sr-only">{t("player.completed")}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      ),
    };
  });

  return (
    <nav aria-label={t("player.outline")}>
      {/* remount when the current lesson moves to another module so that module opens */}
      <Accordion key={currentModule} items={items} multiple variant="plain" defaultOpen={currentModule ? [currentModule] : []} />
    </nav>
  );
}
