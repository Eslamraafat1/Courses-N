"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Save } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Select, Textarea } from "@/components/ui/Field";
import { Link } from "@/components/ui/Link";
import { useToast } from "@/components/ui/Toast";
import { VideoEmbed } from "@/components/video/VideoEmbed";
import { parseVideoUrl } from "@/lib/video";
import type { Category, Instructor } from "@/types";
import type { TKey } from "@/lib/i18n";
import { AdminTabs, FormSection } from "./AdminUI";
import type { CourseFormValues } from "./courseForm.shared";

type Tab = "details" | "media" | "pricing" | "seo";
const TAB_OF: Record<keyof CourseFormValues, Tab> = {
  titleEn: "details", titleAr: "details", slug: "details", subtitleEn: "details", subtitleAr: "details", descEn: "details", descAr: "details",
  categoryId: "details", instructorId: "details", level: "details", status: "details", tags: "details",
  thumbnail: "media", videoUrl: "media",
  price: "pricing", oldPrice: "pricing", duration: "pricing", featured: "pricing", trending: "pricing",
  seoTitle: "seo", seoDescription: "seo",
};
const TAB_LABEL: Record<Tab, TKey> = { details: "admin.form.tab.details", media: "admin.form.tab.media", pricing: "admin.form.tab.pricing", seo: "admin.form.tab.seo" };
const KNOWN_IMG = /^https:\/\/(images\.unsplash\.com|i\.ytimg\.com)\//;

function Check({ label, hint, ...rest }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3">
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" {...rest} />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function CourseForm({ initial, categories, instructors, mode }: { initial: CourseFormValues; categories: Category[]; instructors: Instructor[]; mode: "create" | "edit" }) {
  const { t, l } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("details");
  const [saved, setSaved] = useState(false);

  const schema = useMemo(() => {
    const money = (req: boolean) =>
      z.string().refine((v) => (v.trim() === "" ? !req : /^\d+(\.\d{1,2})?$/.test(v.trim())), { message: t("admin.form.err.number") });
    return z
      .object({
        titleEn: z.string().trim().min(3, { message: t("admin.form.err.min", { n: 3 }) }),
        titleAr: z.string().trim().min(3, { message: t("admin.form.err.min", { n: 3 }) }),
        slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: t("admin.form.err.slug") }),
        subtitleEn: z.string().trim().max(140, { message: t("admin.form.err.max", { n: 140 }) }),
        subtitleAr: z.string().trim().max(140, { message: t("admin.form.err.max", { n: 140 }) }),
        descEn: z.string().trim().min(20, { message: t("admin.form.err.min", { n: 20 }) }),
        descAr: z.string().trim().min(20, { message: t("admin.form.err.min", { n: 20 }) }),
        categoryId: z.string().min(1, { message: t("form.required") }),
        instructorId: z.string().min(1, { message: t("form.required") }),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        status: z.enum(["published", "draft", "archived"]),
        tags: z.string().max(200, { message: t("admin.form.err.max", { n: 200 }) }),
        thumbnail: z.string().trim().refine((v) => v === "" || /^https:\/\/\S+$/.test(v), { message: t("admin.form.err.https") }),
        videoUrl: z.string().trim().refine((v) => v === "" || parseVideoUrl(v) !== null, { message: t("video.invalid") }),
        price: money(true),
        oldPrice: money(false),
        duration: z.string().refine((v) => /^\d+(\.\d)?$/.test(v.trim()) && Number(v) > 0, { message: t("admin.form.err.positive") }),
        featured: z.boolean(),
        trending: z.boolean(),
        seoTitle: z.string().trim().max(70, { message: t("admin.form.err.max", { n: 70 }) }),
        seoDescription: z.string().trim().max(160, { message: t("admin.form.err.max", { n: 160 }) }),
      })
      .refine((v) => v.oldPrice.trim() === "" || Number(v.oldPrice) > Number(v.price), { path: ["oldPrice"], message: t("admin.form.err.oldPrice") });
  }, [t]);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: "onTouched",
  });

  const videoUrl = useWatch({ control, name: "videoUrl" }) ?? "";
  const thumb = useWatch({ control, name: "thumbnail" }) ?? "";
  const seoTitle = useWatch({ control, name: "seoTitle" }) ?? "";
  const seoDesc = useWatch({ control, name: "seoDescription" }) ?? "";
  const titleEn = useWatch({ control, name: "titleEn" }) ?? "";
  const slug = useWatch({ control, name: "slug" }) ?? "";
  const parsed = useMemo(() => parseVideoUrl(videoUrl.trim()), [videoUrl]);

  const errKeys = Object.keys(errors) as (keyof CourseFormValues)[];
  const countFor = (tb: Tab) => errKeys.filter((k) => TAB_OF[k] === tb).length;

  const onValid = () => {
    setSaved(true);
    toast.info(t("form.validated"), t("admin.form.nothingSaved"));
  };
  const onInvalid = (errs: typeof errors) => {
    setSaved(false);
    const first = (Object.keys(errs) as (keyof CourseFormValues)[])[0];
    if (first) setTab(TAB_OF[first]);
    toast.error(t("admin.form.fixErrors", { n: Object.keys(errs).length }));
  };

  const e = (k: keyof CourseFormValues) => errors[k]?.message as string | undefined;

  const panels = [
    {
      id: "details",
      label: t(TAB_LABEL.details),
      badge: countFor("details"),
      panel: (
        <div className="grid gap-8">
          <FormSection title={t("admin.form.basics")} description={t("admin.form.basicsDesc")}>
            <Input label={t("admin.form.titleEn")} error={e("titleEn")} dir="ltr" {...register("titleEn")} />
            <Input label={t("admin.form.titleAr")} error={e("titleAr")} dir="rtl" {...register("titleAr")} />
            <div className="span-2">
              <Input label={t("admin.form.slug")} hint={t("admin.form.slugHint")} error={e("slug")} dir="ltr" {...register("slug")} />
            </div>
            <Input label={t("admin.form.subtitleEn")} error={e("subtitleEn")} dir="ltr" optionalLabel={t("label.optional")} {...register("subtitleEn")} />
            <Input label={t("admin.form.subtitleAr")} error={e("subtitleAr")} dir="rtl" optionalLabel={t("label.optional")} {...register("subtitleAr")} />
            <Textarea label={t("admin.form.descEn")} error={e("descEn")} dir="ltr" {...register("descEn")} />
            <Textarea label={t("admin.form.descAr")} error={e("descAr")} dir="rtl" {...register("descAr")} />
          </FormSection>
          <FormSection title={t("admin.form.classification")} description={t("admin.form.classificationDesc")}>
            <Select label={t("admin.col.category")} error={e("categoryId")} {...register("categoryId")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{l(c.name)}</option>
              ))}
            </Select>
            <Select label={t("admin.col.instructor")} error={e("instructorId")} {...register("instructorId")}>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{l(i.name)}</option>
              ))}
            </Select>
            <Select label={t("admin.col.level")} error={e("level")} {...register("level")}>
              {(["beginner", "intermediate", "advanced"] as const).map((v) => (
                <option key={v} value={v}>{t(`level.${v}`)}</option>
              ))}
            </Select>
            <Select label={t("admin.col.status")} error={e("status")} {...register("status")}>
              {(["draft", "published", "archived"] as const).map((v) => (
                <option key={v} value={v}>{t(`admin.status.${v}`)}</option>
              ))}
            </Select>
            <div className="span-2">
              <Input label={t("admin.form.tags")} hint={t("admin.form.tagsHint")} error={e("tags")} dir="ltr" {...register("tags")} />
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      id: "media",
      label: t(TAB_LABEL.media),
      badge: countFor("media"),
      panel: (
        <div className="grid gap-8">
          <FormSection title={t("admin.form.video")} description={t("admin.form.videoDesc")}>
            <div className="span-2">
              <Input type="url" inputMode="url" label={t("admin.form.videoUrl")} hint={t("admin.form.videoHint")} error={e("videoUrl")} dir="ltr" optionalLabel={t("label.optional")} {...register("videoUrl")} />
            </div>
            <div className="span-2">
              <p className="mb-2 text-sm font-semibold">{t("admin.form.livePreview")}</p>
              {videoUrl.trim() === "" ? (
                <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">{t("admin.form.previewEmpty")}</p>
              ) : (
                <div className="max-w-2xl overflow-hidden rounded-2xl border border-line">
                  <VideoEmbed url={videoUrl.trim()} title={titleEn || t("admin.form.previewTitle")} />
                </div>
              )}
              {parsed && <p className="mt-2 text-sm text-muted">{t("admin.form.detected", { provider: parsed.provider })}</p>}
            </div>
          </FormSection>
          <FormSection title={t("admin.form.thumbnail")} description={t("admin.form.thumbnailDesc")}>
            <div className="span-2">
              <Input type="url" inputMode="url" label={t("admin.form.thumbnailUrl")} error={e("thumbnail")} dir="ltr" optionalLabel={t("label.optional")} {...register("thumbnail")} />
            </div>
            <div className="span-2">
              {KNOWN_IMG.test(thumb.trim()) ? (
                <Image src={thumb.trim()} alt="" width={320} height={180} sizes="320px" className="aspect-video w-full max-w-xs rounded-2xl border border-line object-cover" />
              ) : (
                <p className="text-sm text-muted">{t("admin.form.thumbnailNote")}</p>
              )}
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      id: "pricing",
      label: t(TAB_LABEL.pricing),
      badge: countFor("pricing"),
      panel: (
        <div className="grid gap-8">
          <FormSection title={t("admin.form.pricing")} description={t("admin.form.pricingDesc")}>
            <Input inputMode="decimal" label={t("admin.form.price")} hint={t("admin.form.priceHint")} error={e("price")} dir="ltr" {...register("price")} />
            <Input inputMode="decimal" label={t("admin.form.oldPrice")} error={e("oldPrice")} dir="ltr" optionalLabel={t("label.optional")} {...register("oldPrice")} />
            <Input inputMode="decimal" label={t("admin.form.duration")} error={e("duration")} dir="ltr" {...register("duration")} />
          </FormSection>
          <FormSection title={t("admin.form.promo")} description={t("admin.form.promoDesc")}>
            <Check label={t("label.featured")} hint={t("admin.form.featuredHint")} {...register("featured")} />
            <Check label={t("label.trending")} hint={t("admin.form.trendingHint")} {...register("trending")} />
          </FormSection>
        </div>
      ),
    },
    {
      id: "seo",
      label: t(TAB_LABEL.seo),
      badge: countFor("seo"),
      panel: (
        <FormSection title={t("admin.form.seo")} description={t("admin.form.seoDesc")}>
          <div className="span-2">
            <Input label={t("admin.form.seoTitle")} hint={t("admin.form.chars", { n: seoTitle.length, max: 70 })} error={e("seoTitle")} dir="ltr" optionalLabel={t("label.optional")} {...register("seoTitle")} />
          </div>
          <div className="span-2">
            <Textarea rows={3} label={t("admin.form.seoDescription")} hint={t("admin.form.chars", { n: seoDesc.length, max: 160 })} error={e("seoDescription")} dir="ltr" optionalLabel={t("label.optional")} {...register("seoDescription")} />
          </div>
          <div className="span-2 rounded-2xl border border-line bg-bg2/60 p-4" dir="ltr">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">{t("admin.form.serp")}</p>
            <p className="truncate text-sm text-muted">example.test › courses › {slug || "…"}</p>
            <p className="truncate text-lg font-semibold text-accent">{seoTitle || titleEn || "…"}</p>
            <p className="line-clamp-2 text-sm text-muted">{seoDesc || "…"}</p>
          </div>
        </FormSection>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate aria-label={mode === "create" ? t("admin.courses.new") : t("admin.courses.edit")}>
      {errKeys.length > 0 && (
        <div role="alert" className="mb-6 rounded-2xl border border-coral/40 bg-coral/8 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 text-coral" aria-hidden /> {t("admin.form.fixErrors", { n: errKeys.length })}
          </p>
          <ul className="mt-2 list-disc ps-6 text-muted">
            {errKeys.map((k) => (
              <li key={k}>
                <button type="button" className="underline underline-offset-2 hover:text-ink" onClick={() => setTab(TAB_OF[k])}>
                  {t(TAB_LABEL[TAB_OF[k]])}
                </button>
                : {e(k)}
              </li>
            ))}
          </ul>
        </div>
      )}
      <AdminTabs items={panels} active={tab} onChange={(id) => setTab(id as Tab)} label={t("admin.form.sections")} />

      {saved && (
        <div className="mt-6">
          <NoBackendNotice title={t("form.noBackend.title")} body={t("admin.form.nothingSaved")} />
        </div>
      )}

      <div className="sticky bottom-0 z-20 -mx-3 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/90 px-3 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <p className="text-sm text-muted">{t("admin.form.previewOnly")}</p>
        <div className="flex gap-2">
          <Link href="/admin/courses" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-semibold hover:bg-bg2">
            {t("act.cancel")}
          </Link>
          <Button type="submit" loading={isSubmitting} icon={<Save className="size-4" aria-hidden />}>
            {t("admin.form.validate")}
          </Button>
        </div>
      </div>
    </form>
  );
}
