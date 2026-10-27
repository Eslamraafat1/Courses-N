"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, ClipboardCopy, RotateCcw, Save } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { demoSiteSettings } from "@/data/adminDemo";
import type { HomeSectionId } from "@/data/home";
import { cn } from "@/lib/utils";
import { AdminPageHeader, FormSection, IconButton, Panel } from "./AdminUI";

/* ============================ Homepage sections ============================ */
interface Sec { id: HomeSectionId; enabled: boolean }

function move<T>(arr: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

export function HomepageView({ initial }: { initial: Sec[] }) {
  const { t, n } = useI18n();
  const toast = useToast();
  const [secs, setSecs] = useState<Sec[]>(initial);
  const dirty = JSON.stringify(secs) !== JSON.stringify(initial);
  const json = useMemo(() => JSON.stringify(secs, null, 2), [secs]);
  const label = (id: HomeSectionId) => t(`admin.section.${id}`);
  const enabled = secs.filter((s) => s.enabled);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      toast.success(t("admin.homepage.copied"), t("admin.homepage.copiedHint"));
    } catch {
      toast.error(t("act.copyFailed"));
    }
  };

  return (
    <>
      <AdminPageHeader
        title={t("admin.homepage.title")}
        lead={t("admin.homepage.lead")}
        actions={
          <>
            {dirty && <Button variant="outline" size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setSecs(initial)}>{t("admin.resetDemo")}</Button>}
            <Button size="sm" icon={<ClipboardCopy className="size-4" aria-hidden />} onClick={() => void copy()}>{t("admin.homepage.copy")}</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title={t("admin.homepage.sections")} description={t("admin.homepage.sectionsDesc", { on: n(enabled.length), total: n(secs.length) })} bodyClassName="!p-0">
          <ol className="divide-y divide-line">
            {secs.map((s, i) => (
              <li key={s.id} className={cn("flex items-center gap-3 px-3 py-2.5 sm:px-5", !s.enabled && "bg-bg2/40")}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg2 text-xs font-bold tabular-nums text-muted">{n(i + 1)}</span>
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={s.enabled}
                    onChange={() => setSecs((p) => p.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)))}
                    className="size-5 shrink-0 accent-[var(--accent)]"
                  />
                  <span className={cn("min-w-0 truncate text-sm font-semibold", !s.enabled && "text-muted line-through")}>{label(s.id)}</span>
                  <span className="sr-only">{s.enabled ? t("admin.status.visible") : t("admin.status.hidden")}</span>
                </label>
                <IconButton label={t("admin.moveUp", { name: label(s.id) })} disabled={i === 0} onClick={() => setSecs((p) => move(p, i, -1))}><ArrowUp className="size-4" aria-hidden /></IconButton>
                <IconButton label={t("admin.moveDown", { name: label(s.id) })} disabled={i === secs.length - 1} onClick={() => setSecs((p) => move(p, i, 1))}><ArrowDown className="size-4" aria-hidden /></IconButton>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="grid content-start gap-4 sm:gap-6">
          <Panel title={t("admin.homepage.preview")} description={t("admin.homepage.previewDesc")}>
            <ol className="relative grid gap-1.5 border-s-2 border-line ps-4" aria-live="polite">
              {enabled.map((s, i) => (
                <li key={s.id} className="relative text-sm">
                  <span aria-hidden className="absolute -start-[1.4rem] top-1.5 size-2.5 rounded-full bg-accent" />
                  <span className="me-2 tabular-nums text-muted">{n(i + 1)}</span>
                  {label(s.id)}
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title={t("admin.homepage.config")} description={t("admin.homepage.configDesc")}>
            <pre dir="ltr" tabIndex={0} data-lenis-prevent className="max-h-64 overflow-auto rounded-xl bg-bg2 p-3 text-xs leading-relaxed" aria-label={t("admin.homepage.config")}>{json}</pre>
            <p className="mt-3 text-sm text-muted">{t("admin.homepage.configHow")}</p>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ============================ Settings ============================ */
interface SettingsForm {
  nameAr: string; nameEn: string; defaultLang: "ar" | "en"; defaultTheme: "system" | "light" | "dark";
  supportEmail: string; x: string; linkedin: string; youtube: string; seoTitle: string; seoDescription: string;
}

export function SettingsView() {
  const { t } = useI18n();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const schema = useMemo(() => {
    const url = z.string().trim().refine((v) => v === "" || /^https:\/\/[^\s.]+\.\S+$/.test(v), { message: t("admin.form.err.https") });
    return z.object({
      nameAr: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
      nameEn: z.string().trim().min(2, { message: t("admin.form.err.min", { n: 2 }) }),
      defaultLang: z.enum(["ar", "en"]),
      defaultTheme: z.enum(["system", "light", "dark"]),
      supportEmail: z.string().trim().refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: t("form.invalidEmail") }),
      x: url, linkedin: url, youtube: url,
      seoTitle: z.string().trim().min(3, { message: t("admin.form.err.min", { n: 3 }) }).max(70, { message: t("admin.form.err.max", { n: 70 }) }),
      seoDescription: z.string().trim().max(160, { message: t("admin.form.err.max", { n: 160 }) }),
    });
  }, [t]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: { ...demoSiteSettings },
    mode: "onTouched",
  });

  return (
    <>
      <AdminPageHeader title={t("admin.settings.title")} lead={t("admin.settings.lead")} />
      <form
        noValidate
        onSubmit={handleSubmit(
          () => { setSaved(true); toast.info(t("form.validated"), t("admin.form.nothingSaved")); },
          (errs) => { setSaved(false); toast.error(t("admin.form.fixErrors", { n: Object.keys(errs).length })); },
        )}
        className="grid gap-10"
      >
        <FormSection title={t("admin.settings.general")} description={t("admin.settings.generalDesc")}>
          <Input label={t("admin.settings.nameEn")} dir="ltr" error={errors.nameEn?.message} {...register("nameEn")} />
          <Input label={t("admin.settings.nameAr")} dir="rtl" error={errors.nameAr?.message} {...register("nameAr")} />
          <Select label={t("admin.settings.defaultLang")} error={errors.defaultLang?.message} {...register("defaultLang")}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </Select>
          <Select label={t("admin.settings.defaultTheme")} error={errors.defaultTheme?.message} {...register("defaultTheme")}>
            {(["system", "light", "dark"] as const).map((v) => (
              <option key={v} value={v}>{t(`theme.${v}`)}</option>
            ))}
          </Select>
          <div className="span-2"><Input type="email" label={t("admin.settings.supportEmail")} dir="ltr" error={errors.supportEmail?.message} {...register("supportEmail")} /></div>
        </FormSection>
        <FormSection title={t("admin.settings.social")} description={t("admin.settings.socialDesc")}>
          <Input type="url" label="X / Twitter" dir="ltr" optionalLabel={t("label.optional")} error={errors.x?.message} {...register("x")} />
          <Input type="url" label="LinkedIn" dir="ltr" optionalLabel={t("label.optional")} error={errors.linkedin?.message} {...register("linkedin")} />
          <div className="span-2"><Input type="url" label="YouTube" dir="ltr" optionalLabel={t("label.optional")} error={errors.youtube?.message} {...register("youtube")} /></div>
        </FormSection>
        <FormSection title={t("admin.settings.seo")} description={t("admin.settings.seoDesc")}>
          <div className="span-2"><Input label={t("admin.form.seoTitle")} dir="ltr" error={errors.seoTitle?.message} {...register("seoTitle")} /></div>
          <div className="span-2"><Textarea rows={3} label={t("admin.form.seoDescription")} dir="ltr" optionalLabel={t("label.optional")} error={errors.seoDescription?.message} {...register("seoDescription")} /></div>
        </FormSection>
        {saved && <NoBackendNotice title={t("form.noBackend.title")} body={t("admin.form.nothingSaved")} />}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-sm text-muted">{t("admin.form.previewOnly")}</p>
          <Button type="submit" loading={isSubmitting} icon={<Save className="size-4" aria-hidden />}>{t("admin.form.validate")}</Button>
        </div>
      </form>
    </>
  );
}
