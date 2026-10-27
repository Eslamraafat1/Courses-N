"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import type { Review } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatDate } from "@/lib/i18n/config";

/** Rating histogram computed from the reviews that exist in the data (not from the headline average). */
export function RatingDistribution({ reviews, rating, count }: { reviews: Review[]; rating: number; count: number }) {
  const { t, n } = useI18n();
  const total = reviews.length;
  const rows = [5, 4, 3, 2, 1].map((stars) => {
    const c = reviews.filter((r) => Math.round(r.rating) === stars).length;
    return { stars, c, pct: total ? Math.round((c / total) * 100) : 0 };
  });
  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
      <div className="text-center sm:text-start">
        <p className="font-display text-6xl font-extrabold leading-none">
          <span className="ltr-run">{rating.toFixed(1)}</span>
        </p>
        <div className="mt-2 flex justify-center gap-0.5 sm:justify-start" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`size-5 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
          ))}
        </div>
        <p className="mt-1 text-sm text-muted">{t("label.reviews", { n: n(count) })}</p>
      </div>
      <div>
        <ul className="space-y-2" aria-label={t("course.distribution")}>
          {rows.map((r) => (
            <li key={r.stars} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 text-muted">
                <span className="ltr-run">{r.stars}</span> {t("course.stars")}
              </span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg2" role="img" aria-label={`${r.stars}: ${r.pct}%`}>
                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
              </span>
              <span className="ltr-run w-10 shrink-0 text-end text-muted">{r.pct}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t("course.distributionNote", { n: n(total) })}</p>
      </div>
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const { t, l, lang } = useI18n();
  if (reviews.length === 0) return <p className="text-muted">{t("course.noReviews")}</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="card flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <Image src={r.avatar} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{l(r.author)}</p>
              <p className="truncate text-xs text-muted">{[r.role ? l(r.role) : null, formatDate(r.date, lang)].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <p className="flex items-center gap-0.5" role="img" aria-label={t("label.rating", { n: r.rating })}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} aria-hidden className={`size-4 ${i <= Math.round(r.rating) ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
            ))}
          </p>
          <p className="text-pretty text-muted">{l(r.text)}</p>
        </li>
      ))}
    </ul>
  );
}

/** Validated review form. There is no API, so a valid submit is NOT saved and the UI says so. */
export function ReviewForm() {
  const { t } = useI18n();
  const toast = useToast();
  const [validated, setValidated] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("form.nameMin")),
        rating: z.coerce.number().int().min(1, t("form.required")).max(5),
        text: z.string().trim().min(10, t("form.messageMin")),
      }),
    [t],
  );
  type Values = z.output<typeof schema>;
  type FormIn = z.input<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormIn, unknown, Values>({ resolver: zodResolver(schema), defaultValues: { name: "", rating: 5, text: "" } });

  const onSubmit = () => {
    setValidated(true);
    toast.info(t("form.validated"));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-5 sm:p-6" aria-labelledby="review-form-title">
      <h3 id="review-form-title" className="font-display text-xl font-bold">
        {t("course.writeReview")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("form.name")} autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Select label={t("course.yourRating")} error={errors.rating?.message} {...register("rating")}>
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {t("label.rating", { n: v })}
            </option>
          ))}
        </Select>
      </div>
      <Textarea label={t("course.yourReview")} rows={4} error={errors.text?.message} {...register("text")} />
      <Button type="submit" loading={isSubmitting}>
        {t("act.submit")}
      </Button>
      {validated && <NoBackendNotice title={t("course.reviewNotSaved")} body={t("course.reviewNotSavedBody")} />}
    </form>
  );
}
