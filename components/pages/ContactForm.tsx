"use client";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/components/providers/I18nProvider";
import { submitContact } from "@/lib/api/browser";
import { cn } from "@/lib/utils";

const TOPICS = ["general", "support", "feedback", "partnership", "teach"] as const;
type Topic = (typeof TOPICS)[number];
const MAX = 600;
const TOPIC_KEY = {
  general: "contact.topic.general",
  support: "contact2.topic.support",
  feedback: "contact.topic.feedback",
  partnership: "contact.topic.partnership",
  teach: "contact2.topic.teach",
} as const;

interface Values {
  name: string;
  email: string;
  topic: Topic;
  subject: string;
  message: string;
  consent: boolean;
}

const EMPTY: Values = { name: "", email: "", subject: "", message: "", topic: "general", consent: false };

/** Validates in the browser. Claims "sent" only when the API says delivered:true; otherwise states plainly that nothing was sent. */
export function ContactForm() {
  const { t } = useI18n();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [result, setResult] = useState<null | "sent" | "checked">(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, t("form.nameMin")),
        email: z.string().trim().min(1, t("form.required")).email(t("form.invalidEmail")),
        topic: z.enum(TOPICS),
        subject: z.string().trim().min(1, t("form.required")),
        message: z.string().trim().min(10, t("form.messageMin")).max(MAX, t("contact2.form.maxError", { max: MAX })),
        consent: z.boolean().refine((v) => v, t("contact.form.consentRequired")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const topic = useWatch({ control, name: "topic" });
  const len = (useWatch({ control, name: "message" }) ?? "").length;

  const onSubmit = handleSubmit(async (v) => {
    try {
      // Demo mode: POST /api/contact validates only (delivered:false). Backend mode: real endpoint.
      const res = await submitContact({ name: v.name, email: v.email, subject: `[${v.topic}] ${v.subject}`, message: v.message });
      if (res.delivered) {
        setResult("sent");
        toast.success(t("form.delivered"));
      } else {
        setResult("checked");
        toast.info(t("form.validated"));
      }
      reset(EMPTY);
    } catch {
      toast.error(t("state.error.title"), t("state.error.body"));
    }
  });

  if (result) {
    const sent = result === "sent";
    return (
      <AnimatePresence mode="wait">
        <motion.div key={result} initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 py-4 text-center">
          <span className={cn("mx-auto grid size-16 place-items-center rounded-full", sent ? "bg-volt text-volt-ink" : "bg-accent/15 text-accent")}>
            {sent ? <CheckCircle2 className="size-8" aria-hidden /> : <Info className="size-8" aria-hidden />}
          </span>
          {sent ? (
            <div role="status">
              <h3 className="font-display text-2xl font-bold">{t("contact2.form.sentTitle")}</h3>
              <p className="mt-2 text-muted">{t("contact2.form.sentBody")}</p>
            </div>
          ) : (
            <div className="text-start">
              <NoBackendNotice title={`${t("contact2.form.checkedTitle")} - ${t("form.noBackend.title")}`} body={`${t("contact2.form.checkedBody")} ${t("form.noBackend.body")}`} />
            </div>
          )}
          <Button variant="outline" onClick={() => setResult(null)}>{t("contact2.form.another")}</Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-label={t("contact.form.title")}>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("contact2.form.topics")}</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((k) => (
            <label key={k} className="relative cursor-pointer">
              <input type="radio" value={k} className="peer sr-only" {...register("topic")} />
              <motion.span
                whileTap={reduce ? undefined : { scale: 0.95 }}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                  topic === k ? "border-volt bg-volt text-volt-ink" : "border-line bg-surface text-ink hover:border-ink",
                )}
              >
                {t(TOPIC_KEY[k])}
              </motion.span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label={t("form.name")} autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label={t("form.email")} type="email" dir="ltr" autoComplete="email" inputMode="email" error={errors.email?.message} {...register("email")} />
      </div>
      <Input label={t("form.subject")} error={errors.subject?.message} {...register("subject")} />
      <div>
        <Textarea label={t("form.message")} rows={6} hint={t("contact2.form.messageHint")} error={errors.message?.message} {...register("message")} />
        <p aria-live="polite" className={cn("mt-1.5 text-end text-xs tabular-nums", len > MAX ? "font-bold text-coral" : "text-muted")}>
          {t("contact2.form.counter", { n: len, max: MAX })}
        </p>
      </div>
      <div>
        <label className="flex min-h-11 items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" aria-invalid={errors.consent ? true : undefined} {...register("consent")} />
          <span>{t("contact.form.consent")}</span>
        </label>
        {errors.consent && <p role="alert" className="mt-1 text-sm font-medium text-coral">{errors.consent.message}</p>}
      </div>
      <Button type="submit" size="lg" loading={isSubmitting}>{t("act.submit")}</Button>
    </form>
  );
}
