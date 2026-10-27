"use client";
import { useSyncExternalStore } from "react";
import { Award, Lock } from "lucide-react";
import type { Course, Instructor } from "@/types";
import { Button } from "@/components/ui/Button";
import { NoBackendNotice } from "@/components/ui/Field";
import { useI18n } from "@/components/providers/I18nProvider";
import { useLastLesson, useProgress } from "@/hooks/useLearning";
import { demoStudent } from "@/data/content";
import { lessonsOf } from "./format";

const noopSubscribe = () => () => undefined;

/** Printable-looking certificate preview. Unlocked only when local progress is 100%; never an official credential. */
export function CertificatePreview({ course, instructor }: { course: Course; instructor: Instructor | undefined }) {
  const { t, l, lang, n } = useI18n();
  const { completed, percent } = useProgress();
  const last = useLastLesson();
  const lessons = lessonsOf(course);
  const done = completed(course.slug).filter((id) => lessons.some((x) => x.id === id)).length;
  const pct = percent(course.slug, lessons.length);
  const unlocked = lessons.length > 0 && done >= lessons.length;
  const resumeId = last.map[course.slug] ?? lessons.find((x) => !completed(course.slug).includes(x.id))?.id ?? lessons[0]?.id;

  // Today's date, read on the client only (the server snapshot is empty so prerendering stays deterministic).
  const today = useSyncExternalStore(
    noopSubscribe,
    () => new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date()),
    () => "",
  );

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">{unlocked ? t("course.cert.unlocked") : t("course.cert.locked")}</span>
              <span className="ltr-run text-muted">
                {n(done)}/{n(lessons.length)} · {pct}%
              </span>
            </div>
            <div role="progressbar" aria-label={t("label.progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2.5 overflow-hidden rounded-full bg-bg2">
              <div className="h-full rounded-full bg-volt transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {!unlocked && resumeId && (
            <Button href={`/learn/${course.slug}/${resumeId}`} size="sm">
              {t("act.continue")}
            </Button>
          )}
        </div>
        {!unlocked && <p className="mt-2 text-sm text-muted">{t("course.cert.lockedHint")}</p>}
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div
          aria-hidden={!unlocked}
          className={`relative overflow-hidden rounded-3xl border-4 border-double border-ink/25 bg-[#fbf8ef] p-6 text-center text-[#16130c] shadow-[var(--shadow)] sm:p-12 ${unlocked ? "" : "pointer-events-none select-none blur-[3px] grayscale"}`}
        >
          <div className="pointer-events-none absolute inset-3 rounded-2xl border border-[#16130c]/20 sm:inset-5" />
          <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full opacity-25 blur-2xl" style={{ background: course.accent }} />
          <Award className="mx-auto size-12 text-[#16130c]/70 sm:size-14" aria-hidden />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-[#16130c]/60">{t("course.cert.academy")}</p>
          <h2 className="font-display mt-3 text-3xl font-extrabold sm:text-5xl">{t("course.cert.title")}</h2>
          <p className="mt-6 text-sm text-[#16130c]/70">{t("course.cert.awardedTo")}</p>
          <p className="font-display mt-2 text-3xl font-bold sm:text-4xl">{l(demoStudent.name)}</p>
          <p className="mt-6 text-sm text-[#16130c]/70">{t("course.cert.forCompleting")}</p>
          <p className="font-display mx-auto mt-2 max-w-xl text-balance text-xl font-bold sm:text-2xl">{l(course.title)}</p>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-6 text-sm">
            <div className="border-t border-[#16130c]/40 pt-2">
              <p className="font-semibold" suppressHydrationWarning>
                {today || "—"}
              </p>
              <p className="text-xs text-[#16130c]/60">{t("course.cert.date")}</p>
            </div>
            <div className="border-t border-[#16130c]/40 pt-2">
              <p className="font-semibold">{instructor ? l(instructor.name) : "—"}</p>
              <p className="text-xs text-[#16130c]/60">{t("course.cert.instructor")}</p>
            </div>
          </div>
          <p className="mt-8 inline-block rotate-[-3deg] rounded-md border-2 border-coral px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-coral">
            {t("course.cert.watermark")}
          </p>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="card flex items-center gap-3 px-5 py-4">
              <Lock className="size-5 text-muted" aria-hidden />
              <span className="font-semibold">{t("course.cert.locked")}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl">
        <NoBackendNotice title={t("course.cert.noticeTitle")} body={t("course.cert.noticeBody")} />
      </div>
    </div>
  );
}
