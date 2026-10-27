"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Video } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/Overlays";
import { useToast } from "@/components/ui/Toast";
import { VideoEmbed } from "@/components/video/VideoEmbed";
import { parseVideoUrl } from "@/lib/video";
import type { L } from "@/types";
import { AdminPageHeader, IconButton, Panel, StatusChip } from "./AdminUI";

export interface AdminLesson { id: string; title: L; duration: number; videoUrl: string; preview: boolean }
export interface AdminModule { id: string; title: L; lessons: AdminLesson[] }
export interface AdminCourseCurriculum { id: string; title: L; modules: AdminModule[] }

interface LessonForm { titleEn: string; titleAr: string; moduleId: string; duration: string; videoUrl: string; preview: boolean }

function move<T>(arr: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

function LessonDialog({ open, onClose, modules, editing, onSave }: { open: boolean; onClose: () => void; modules: AdminModule[]; editing: { moduleId: string; lesson: AdminLesson } | null; onSave: (v: LessonForm, editing: boolean) => void }) {
  const { t, l } = useI18n();
  const schema = useMemo(
    () =>
      z.object({
        titleEn: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
        titleAr: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
        moduleId: z.string().min(1, { message: t("form.required") }),
        duration: z.string().refine((v) => /^\d{1,3}$/.test(v.trim()) && Number(v) > 0, { message: t("admin.form.err.positive") }),
        videoUrl: z.string().trim().refine((v) => v !== "" && parseVideoUrl(v) !== null, { message: t("video.invalid") }),
        preview: z.boolean(),
      }),
    [t],
  );
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<LessonForm>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? { titleEn: editing.lesson.title.en, titleAr: editing.lesson.title.ar, moduleId: editing.moduleId, duration: String(editing.lesson.duration), videoUrl: editing.lesson.videoUrl, preview: editing.lesson.preview }
        : { titleEn: "", titleAr: "", moduleId: modules[0]?.id ?? "", duration: "10", videoUrl: "", preview: false },
    );
  }, [open, editing, modules, reset]);
  const url = useWatch({ control, name: "videoUrl" }) ?? "";

  return (
    <Modal open={open} onClose={onClose} label={editing ? t("admin.lessons.edit") : t("admin.lessons.add")} className="!w-[min(94vw,42rem)]">
      <form
        noValidate
        onSubmit={handleSubmit((v) => {
          onSave(v, !!editing);
          onClose();
        })}
        className="grid max-h-[88dvh] gap-4 overflow-y-auto p-5 pe-16 sm:p-7 sm:pe-16"
        data-lenis-prevent
      >
        <h2 className="font-display text-xl font-bold">{editing ? t("admin.lessons.edit") : t("admin.lessons.add")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("admin.form.titleEn")} dir="ltr" error={errors.titleEn?.message} {...register("titleEn")} />
          <Input label={t("admin.form.titleAr")} dir="rtl" error={errors.titleAr?.message} {...register("titleAr")} />
          <Select label={t("admin.lessons.module")} error={errors.moduleId?.message} {...register("moduleId")}>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{l(m.title)}</option>
            ))}
          </Select>
          <Input label={t("admin.lessons.minutes")} inputMode="numeric" dir="ltr" error={errors.duration?.message} {...register("duration")} />
        </div>
        <Input type="url" label={t("admin.form.videoUrl")} hint={t("admin.form.videoHint")} dir="ltr" error={errors.videoUrl?.message} {...register("videoUrl")} />
        {url.trim() !== "" && parseVideoUrl(url.trim()) && <VideoEmbed url={url.trim()} title={t("admin.form.previewTitle")} className="rounded-2xl" />}
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="size-5 accent-[var(--accent)]" {...register("preview")} />
          {t("admin.lessons.freePreview")}
        </label>
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>{t("act.cancel")}</Button>
          <Button type="submit">{t("admin.form.validateApply")}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function LessonsView({ courses }: { courses: AdminCourseCurriculum[] }) {
  const { t, l, n } = useI18n();
  const confirm = useConfirm();
  const toast = useToast();
  const [data, setData] = useState<Record<string, AdminModule[]>>(() => Object.fromEntries(courses.map((c) => [c.id, c.modules])));
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [dialog, setDialog] = useState<{ open: boolean; editing: { moduleId: string; lesson: AdminLesson } | null }>({ open: false, editing: null });
  const modules = data[courseId] ?? [];
  const total = modules.reduce((s, m) => s + m.lessons.length, 0);

  const setModules = (fn: (m: AdminModule[]) => AdminModule[]) => setData((p) => ({ ...p, [courseId]: fn(p[courseId] ?? []) }));
  const notePersist = () => toast.info(t("admin.toast.changedLocal"), t("admin.toast.notPersisted"));

  const save = (v: LessonForm, editing: boolean) => {
    const lesson: AdminLesson = {
      id: dialog.editing?.lesson.id ?? `new-${Date.now()}`,
      title: { en: v.titleEn, ar: v.titleAr },
      duration: Number(v.duration),
      videoUrl: v.videoUrl.trim(),
      preview: v.preview,
    };
    setModules((ms) => {
      const stripped = ms.map((m) => ({ ...m, lessons: editing && m.id !== v.moduleId ? m.lessons.filter((x) => x.id !== lesson.id) : m.lessons }));
      return stripped.map((m) => {
        if (m.id !== v.moduleId) return m;
        const exists = m.lessons.some((x) => x.id === lesson.id);
        return { ...m, lessons: exists ? m.lessons.map((x) => (x.id === lesson.id ? lesson : x)) : [...m.lessons, lesson] };
      });
    });
    notePersist();
  };

  const remove = async (mid: string, lesson: AdminLesson) => {
    const ok = await confirm({ title: t("admin.lessons.deleteTitle"), body: t("admin.lessons.deleteBody", { name: l(lesson.title) }), confirmLabel: t("act.delete"), danger: true });
    if (!ok) return;
    setModules((ms) => ms.map((m) => (m.id === mid ? { ...m, lessons: m.lessons.filter((x) => x.id !== lesson.id) } : m)));
    notePersist();
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.lessons.title")}
        lead={t("admin.lessons.lead")}
        actions={
          <Button icon={<Plus className="size-4" aria-hidden />} onClick={() => setDialog({ open: true, editing: null })} disabled={!modules.length}>
            {t("admin.lessons.add")}
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-96">
          <Select label={t("admin.lessons.course")} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{l(c.title)}</option>
            ))}
          </Select>
        </div>
        <p className="pb-3 text-sm text-muted" aria-live="polite">
          {t("admin.lessons.summary", { modules: n(modules.length), lessons: n(total) })}
        </p>
      </div>

      <div className="grid gap-4">
        {modules.map((m, mi) => (
          <Panel
            key={m.id}
            title={
              <span className="flex items-center gap-2">
                <span className="text-muted tabular-nums">{n(mi + 1)}.</span> {l(m.title)}
              </span>
            }
            actions={
              <div className="flex gap-2">
                <IconButton label={t("admin.moveUp", { name: l(m.title) })} disabled={mi === 0} onClick={() => { setModules((ms) => move(ms, mi, -1)); notePersist(); }}><ArrowUp className="size-4" aria-hidden /></IconButton>
                <IconButton label={t("admin.moveDown", { name: l(m.title) })} disabled={mi === modules.length - 1} onClick={() => { setModules((ms) => move(ms, mi, 1)); notePersist(); }}><ArrowDown className="size-4" aria-hidden /></IconButton>
              </div>
            }
            bodyClassName="!p-0"
          >
            {m.lessons.length === 0 ? (
              <p className="p-5 text-sm text-muted">{t("admin.lessons.emptyModule")}</p>
            ) : (
              <ol className="divide-y divide-line">
                {m.lessons.map((ls, li) => (
                  <li key={ls.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg2 text-xs font-bold tabular-nums text-muted">{n(li + 1)}</span>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate font-semibold">{l(ls.title)}</p>
                      <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <Video className="size-3.5" aria-hidden /> {t("label.minutes", { n: n(ls.duration) })}
                        {ls.preview && <StatusChip tone="info">{t("label.preview")}</StatusChip>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <IconButton label={t("admin.moveUp", { name: l(ls.title) })} disabled={li === 0} onClick={() => { setModules((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: move(x.lessons, li, -1) } : x))); notePersist(); }}><ArrowUp className="size-4" aria-hidden /></IconButton>
                      <IconButton label={t("admin.moveDown", { name: l(ls.title) })} disabled={li === m.lessons.length - 1} onClick={() => { setModules((ms) => ms.map((x) => (x.id === m.id ? { ...x, lessons: move(x.lessons, li, 1) } : x))); notePersist(); }}><ArrowDown className="size-4" aria-hidden /></IconButton>
                      <IconButton label={`${t("act.edit")}: ${l(ls.title)}`} onClick={() => setDialog({ open: true, editing: { moduleId: m.id, lesson: ls } })}><Pencil className="size-4" aria-hidden /></IconButton>
                      <IconButton label={`${t("act.delete")}: ${l(ls.title)}`} danger onClick={() => void remove(m.id, ls)}><Trash2 className="size-4" aria-hidden /></IconButton>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        ))}
      </div>
      <LessonDialog open={dialog.open} onClose={() => setDialog((d) => ({ ...d, open: false }))} modules={modules} editing={dialog.editing} onSave={save} />
    </>
  );
}
