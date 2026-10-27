"use client";
import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/providers/I18nProvider";

/* ---------- Sample earnings explainer: pure arithmetic on slider values, labelled as sample ---------- */
export function EarningsExplainer() {
  const { t, lang } = useI18n();
  const [students, setStudents] = useState(200);
  const [price, setPrice] = useState(60);
  const [share, setShare] = useState(70);
  const gross = students * price;
  const net = Math.round((gross * share) / 100);
  const money = useMemo(() => new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), [lang]);
  const uid = useId();

  const slider = (id: string, label: string, value: number, min: number, max: number, step: number, set: (n: number) => void, shown: string) => (
    <div>
      <label htmlFor={`${uid}-${id}`} className="flex items-center justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        <output htmlFor={`${uid}-${id}`} className="rounded-full bg-bg2 px-3 py-0.5 tabular-nums">{shown}</output>
      </label>
      <input id={`${uid}-${id}`} type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-3 h-2 w-full cursor-pointer accent-[var(--accent)]" />
    </div>
  );

  return (
    <div className="grid gap-8 rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-7">
        {slider("s", t("teach.earn.students"), students, 20, 2000, 10, setStudents, students.toLocaleString(lang === "ar" ? "ar-EG" : "en-US"))}
        {slider("p", t("teach.earn.price"), price, 10, 200, 5, setPrice, money.format(price))}
        {slider("sh", t("teach.earn.share"), share, 50, 90, 5, setShare, `${share}%`)}
      </div>
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-ink p-6 text-bg" aria-live="polite">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-bg/60">{t("teach.earn.gross")}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">{money.format(gross)}</dd>
          </div>
          <div>
            <dt className="text-sm text-bg/60">{t("teach.earn.net")}</dt>
            <dd className="font-display text-5xl font-black tabular-nums text-volt">{money.format(net)}</dd>
          </div>
          <div>
            <dt className="text-sm text-bg/60">{t("teach.earn.year")}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">
              {money.format(net * 12)}
            </dd>
          </div>
        </dl>
        <p className="rounded-xl border border-dashed border-bg/30 p-3 text-xs text-bg/70">{t("teach.earn.note")}</p>
      </div>
    </div>
  );
}

/* ---------- Application form: validates only. No endpoint exists, so it never claims anything was sent. ---------- */
const AREAS = ["dev", "design", "ai", "business", "other"] as const;
const AREA_KEY = {
  dev: "teach.exp.dev",
  design: "teach.exp.design",
  ai: "teach.exp.ai",
  business: "teach.exp.business",
  other: "teach.exp.other",
} as const;
const EXP_KEY = ["teach.form.exp.0", "teach.form.exp.1", "teach.form.exp.2", "teach.form.exp.3"] as const;

interface Values {
  name: string;
  email: string;
  area: (typeof AREAS)[number];
  experience: string;
  idea: string;
  pitch: string;
  portfolio: string;
  consent: boolean;
}
const EMPTY: Values = { name: "", email: "", area: "dev", experience: "0", idea: "", pitch: "", portfolio: "", consent: false };

export function TeachForm() {
  const { t } = useI18n();
  const toast = useToast();
  const [checked, setChecked] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("form.nameMin")),
        email: z.string().trim().min(1, t("form.required")).email(t("form.invalidEmail")),
        area: z.enum(AREAS),
        experience: z.string().min(1, t("form.required")),
        idea: z.string().trim().min(3, t("form.required")),
        pitch: z.string().trim().min(20, t("form.messageMin")),
        portfolio: z.string().trim().refine((v) => v === "" || /^https?:\/\/\S+\.\S+$/.test(v), t("teach.form.invalidUrl")),
        consent: z.boolean().refine((v) => v, t("contact.form.consentRequired")),
      }),
    [t],
  );
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  // No API endpoint exists for instructor applications: validate locally and say so. Nothing is sent.
  const onSubmit = handleSubmit(async () => {
    setChecked(true);
    toast.info(t("form.validated"));
    reset(EMPTY);
  });

  if (checked) {
    return (
      <div className="space-y-5">
        <NoBackendNotice title={`${t("teach.form.checkedTitle")} - ${t("form.noBackend.title")}`} body={`${t("teach.form.checkedBody")} ${t("form.noBackend.body")}`} />
        <Button variant="outline" onClick={() => setChecked(false)}>{t("teach.form.again")}</Button>
      </div>
    );
  }

  return (
    <form id="apply-form" onSubmit={onSubmit} noValidate className="space-y-5" aria-label={t("teach.form.title")}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label={t("form.name")} autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label={t("form.email")} type="email" dir="ltr" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label={t("teach.form.expertise")} error={errors.area?.message} {...register("area")}>
          {AREAS.map((a) => <option key={a} value={a}>{t(AREA_KEY[a])}</option>)}
        </Select>
        <Select label={t("teach.form.experience")} error={errors.experience?.message} {...register("experience")}>
          {EXP_KEY.map((k, i) => <option key={k} value={String(i)}>{t(k)}</option>)}
        </Select>
      </div>
      <Input label={t("teach.form.idea")} error={errors.idea?.message} {...register("idea")} />
      <Textarea label={t("teach.form.pitch")} rows={5} error={errors.pitch?.message} {...register("pitch")} />
      <Input label={t("teach.form.portfolio")} optionalLabel={t("teach.form.optional")} type="url" dir="ltr" inputMode="url" placeholder="https://" error={errors.portfolio?.message} {...register("portfolio")} />
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" aria-invalid={errors.consent ? true : undefined} {...register("consent")} />
          <span>{t("teach.form.consent")}</span>
        </label>
        {errors.consent && <p role="alert" className="mt-1 text-sm font-medium text-coral">{errors.consent.message}</p>}
      </div>
      <Button type="submit" size="lg" loading={isSubmitting}>{t("act.submit")}</Button>
    </form>
  );
}
