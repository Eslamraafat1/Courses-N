"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, FileText, HardDrive, Link2, Code2, Presentation } from "lucide-react";
import type { Lesson, Resource } from "@/types";
import { Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useNotes } from "@/hooks/useLearning";
import { fmtMinutes } from "@/components/courses/format";

const kindIcon = { pdf: FileText, link: Link2, code: Code2, slides: Presentation } as const;

/** Attached resources. A "#" href means the demo has no real file, so it is shown as unavailable rather than as a dead link. */
export function ResourceList({ resources }: { resources: Resource[] }) {
  const { t, l } = useI18n();
  if (resources.length === 0) return <p className="text-muted">{t("player.noResources")}</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {resources.map((r) => {
        const Icon = kindIcon[r.kind];
        const real = /^https?:\/\//.test(r.href);
        const body = (
          <>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-bg2" aria-hidden>
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{l(r.title)}</span>
              <span className="text-xs uppercase text-muted">{r.kind}{real ? "" : ` · ${t("player.sampleOnly")}`}</span>
            </span>
            {real && <ExternalLink className="size-4 shrink-0 text-muted" aria-hidden />}
          </>
        );
        return (
          <li key={r.id}>
            {real ? (
              <Link href={r.href} className="card flex min-h-14 items-center gap-3 p-3 hover:border-ink">
                {body}
              </Link>
            ) : (
              <div className="card flex min-h-14 items-center gap-3 p-3 opacity-70" aria-disabled="true">
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Per-lesson notes, written straight to localStorage on every change. */
export function NotesPanel({ lessonId }: { lessonId: string }) {
  const { t } = useI18n();
  const { notes, set } = useNotes();
  const value = notes[lessonId] ?? "";
  return (
    <div className="space-y-3">
      <Textarea
        label={t("player.notes")}
        rows={8}
        value={value}
        maxLength={5000}
        onChange={(e) => set(lessonId, e.target.value)}
        placeholder={t("player.notesPlaceholder")}
        hint={t("player.notesHint")}
      />
      <p className="flex items-center gap-2 text-xs text-muted" role="status">
        <HardDrive className="size-3.5" aria-hidden /> {t("player.savedLocally")}
        <span className="ltr-run ms-auto">{value.length}/5000</span>
      </p>
    </div>
  );
}

const SAMPLE_QA = [
  { id: "q1", q: { ar: "هل يمكنني تطبيق هذا الدرس على مشروع حقيقي مباشرة؟", en: "Can I apply this lesson to a real project straight away?" }, a: { ar: "نعم، جرّب المثال أولًا ثم عدّله ليناسب مشروعك.", en: "Yes — run the example first, then adapt it to your own project." } },
  { id: "q2", q: { ar: "ما أفضل طريقة لمراجعة ما تعلمته؟", en: "What is the best way to review what I learned?" }, a: { ar: "دوّن ملاحظاتك في تبويب الملاحظات وأعد المشاهدة بسرعة 1.5x.", en: "Write notes in the Notes tab and re-watch at 1.5x speed." } },
] as const;

/** Q&A UI. It is a demo: samples are static and a valid question is never sent anywhere. */
export function QaPanel() {
  const { t, l } = useI18n();
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(5, t("player.qa.titleMin")),
        body: z.string().trim().min(10, t("form.messageMin")),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", body: "" } });

  return (
    <div className="space-y-8">
      <NoBackendNotice title={t("player.qa.demoTitle")} body={t("player.qa.demoBody")} />
      <form
        noValidate
        onSubmit={handleSubmit(() => {
          setSent(true);
          toast.info(t("form.validated"));
          reset();
        })}
        className="space-y-4"
        aria-label={t("player.qa.ask")}
      >
        <Input label={t("player.qa.question")} error={errors.title?.message} {...register("title")} />
        <Textarea label={t("player.qa.details")} rows={4} error={errors.body?.message} {...register("body")} />
        <Button type="submit">{t("player.qa.ask")}</Button>
        {sent && <p role="status" className="text-sm text-muted">{t("player.qa.notSent")}</p>}
      </form>
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          {t("player.qa.samples")} <Badge>{t("player.qa.demoBadge")}</Badge>
        </h3>
        <ul className="space-y-3">
          {SAMPLE_QA.map((x) => (
            <li key={x.id} className="card p-4">
              <p className="font-semibold">{l(x.q)}</p>
              <p className="mt-1.5 text-sm text-muted">{l(x.a)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RelatedLessons({ courseSlug, lessons }: { courseSlug: string; lessons: Lesson[] }) {
  const { t, l } = useI18n();
  if (lessons.length === 0) return <p className="text-muted">{t("player.noRelated")}</p>;
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {lessons.map((x) => (
        <li key={x.id}>
          <Link href={`/learn/${courseSlug}/${x.id}`} className="card flex min-h-14 items-center justify-between gap-3 p-3 text-sm hover:border-ink">
            <span className="min-w-0 truncate font-semibold">{l(x.title)}</span>
            <span className="ltr-run shrink-0 text-xs text-muted">{fmtMinutes(t, x.duration)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
