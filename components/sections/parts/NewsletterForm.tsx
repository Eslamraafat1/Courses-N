"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { FloatingShapes } from "@/components/animations/Fx";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { Input, NoBackendNotice } from "@/components/ui/Field";
import { Link } from "@/components/ui/Link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/ui/Toast";
import { submitNewsletter as postNewsletter } from "@/lib/api/browser";

interface NewsletterValues {
  email: string;
  consent: boolean;
}

/**
 * Goes through the API layer: Demo mode → POST /api/newsletter (validates only, `delivered:false`);
 * Backend mode → the real endpoint. We only claim success when the API says `delivered: true`.
 */
async function submitNewsletter(values: NewsletterValues): Promise<{ sent: boolean }> {
  const res = await postNewsletter({ email: values.email });
  return { sent: res.delivered };
}

export function NewsletterForm() {
  const { t, isRtl } = useI18n();
  const toast = useToast();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "validated" | "error">("idle");

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().min(1, t("form.required")).email(t("form.invalidEmail")),
        consent: z.boolean().refine((v) => v, t("home2.news.consentError")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({ resolver: zodResolver(schema), defaultValues: { email: "", consent: false }, mode: "onSubmit" });

  const onSubmit = async (values: NewsletterValues) => {
    setStatus("idle");
    try {
      const { sent } = await submitNewsletter(values);
      setStatus(sent ? "idle" : "validated");
      if (sent) {
        reset();
        toast.success(t("form.delivered"));
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container-x py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
        <FloatingShapes className="!-z-0" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p id="news-h" className="eyebrow mb-3 flex items-center gap-2">
                <Mail className="size-4" aria-hidden /> {t("home2.news.eyebrow")}
              </p>
            </Reveal>
            <SplitText text={t("home2.news.title")} className="hd-2" />
            <Reveal delay={0.1}>
              <p className="mt-4 text-lg text-muted">{t("home2.news.lead")}</p>
            </Reveal>
            {/* envelope + paper plane: the plane only flies while the request is actually in flight */}
            <div aria-hidden className="float-y relative mt-8 grid h-28 w-44 place-items-center rounded-3xl border border-line bg-bg2 shadow-[var(--shadow)]">
              <Mail className="size-14 text-accent" strokeWidth={1.5} />
              <motion.span
                className="absolute -end-4 -top-4 grid size-12 place-items-center rounded-full bg-volt text-volt-ink shadow-lg"
                animate={
                  reduce
                    ? undefined
                    : isSubmitting
                      ? { x: isRtl ? [0, -40, -260] : [0, 40, 260], y: [0, -30, -90], rotate: [0, -10, -20], opacity: [1, 1, 0], scale: [1, 1.1, 0.6] }
                      : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
                }
                transition={isSubmitting ? { duration: 1.2, ease: "easeIn", repeat: Infinity, repeatDelay: 0.2 } : { type: "spring", stiffness: 200, damping: 16 }}
              >
                <Send className="size-5 rtl-flip" />
              </motion.span>
            </div>
          </div>

          <Reveal delay={0.15}>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-describedby="news-demo">
              <Input
                label={t("form.email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@example.com"
                dir="ltr"
                disabled={isSubmitting}
                error={errors.email?.message}
                {...register("email")}
              />
              <div>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? "news-consent-err" : undefined}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                    {...register("consent")}
                  />
                  <span>
                    {t("home2.news.consent")}{" "}
                    <Link href="/privacy" className="font-semibold underline underline-offset-4">
                      {t("home2.news.privacy")}
                    </Link>
                  </span>
                </label>
                {errors.consent && (
                  <p id="news-consent-err" role="alert" className="mt-1 text-sm font-medium text-coral">
                    {errors.consent.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? t("form.sending") : t("home2.news.cta")}
              </Button>
              <p id="news-demo" className="text-xs text-muted">{t("home2.news.demo")}</p>

              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  {status === "validated" && (
                    <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <NoBackendNotice title={`${t("form.validated")}`} body={`${t("form.noBackend.title")}. ${t("form.noBackend.body")}`} />
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.p key="err" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-coral/40 bg-coral/5 p-4 text-sm font-medium text-coral">
                      {t("state.error.body")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
