"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/components/animations/Motion";
import { TiltCard } from "@/components/animations/Fx";
import { Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

type Period = "monthly" | "yearly";

/** Price that rolls from the previous amount to the new one when the billing period changes. */
function MorphPrice({ value, className }: { value: number; className?: string }) {
  const { n } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || prev.current === value) {
      el.textContent = `$${n(value)}`;
      prev.current = value;
      return;
    }
    const c = animate(prev.current, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `$${n(Math.round(v))}`;
      },
      onComplete: () => {
        prev.current = value;
      },
    });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce, n]);
  return (
    <span ref={ref} className={cn("ltr-run tabular-nums", className)}>
      ${n(value)}
    </span>
  );
}

export function PlansToggle({ plans }: { plans: Plan[] }) {
  const { t, l, n } = useI18n();
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<Period>("monthly");

  const savings = Math.max(0, ...plans.filter((p) => p.price > 0).map((p) => Math.round((1 - p.yearly / (p.price * 12)) * 100)));

  return (
    <div className="container-x py-20 sm:py-28">
      <style>{`
        @keyframes plan-spin { to { transform: rotate(360deg); } }
        .plan-spin { animation: plan-spin 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .plan-spin { animation: none; } }
      `}</style>
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p id="plans-h" className="eyebrow mb-3">{t("home2.plans.eyebrow")}</p>
        </Reveal>
        <SplitText text={t("home2.plans.title")} className="hd-2" />
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg text-muted">{t("home2.plans.lead")}</p>
        </Reveal>

        <div role="group" aria-label={t("home2.plans.billing")} className="mt-8 inline-flex rounded-full border border-line bg-surface p-1">
          {(["monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className="relative min-h-11 rounded-full px-5 text-sm font-bold sm:px-7"
            >
              {period === p && <motion.span layoutId="plans-period" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={cn("relative flex items-center gap-2 transition-colors", period === p ? "text-bg" : "text-muted")}>
                {t(`home2.plans.${p}`)}
                {p === "yearly" && savings > 0 && (
                  <motion.span
                    animate={reduce || period === "yearly" ? { scale: 1 } : { scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4 }}
                    className="rounded-full bg-volt px-2 py-0.5 text-xs font-bold text-volt-ink"
                  >
                    {t("home2.plans.save", { n: n(savings) })}
                  </motion.span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Stagger className="mx-auto mt-14 grid max-w-6xl items-stretch gap-5 md:grid-cols-3 md:gap-6">
        {plans.map((p) => {
          const hot = !!p.highlighted;
          const free = p.price === 0;
          const amount = period === "monthly" ? p.price : p.yearly;
          return (
            <StaggerItem key={p.id} className={cn(hot && "md:-my-4")}>
              <TiltCard className="h-full" max={hot ? 6 : 5}>
                <div className={cn("relative isolate h-full rounded-[2rem]", hot && "overflow-hidden p-[2px] shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--accent)_70%,transparent)]")}>
                  {hot && (
                    <span aria-hidden className="plan-spin absolute -inset-[60%] -z-10 bg-[conic-gradient(from_0deg,var(--accent),var(--volt),var(--coral),var(--accent))]" />
                  )}
                  <article
                    aria-labelledby={`plan-${p.id}`}
                    className={cn(
                      "shine relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-7 sm:p-8",
                      hot ? "rounded-[calc(2rem-2px)] border-transparent bg-ink text-bg" : "card",
                      !hot && p.id === "team" && "bg-bg2",
                    )}
                  >
                    {hot && (
                      <Badge tone="volt" className="absolute -top-0 start-7 rounded-t-none">
                        {t("home2.plans.popular")}
                      </Badge>
                    )}
                    <h3 id={`plan-${p.id}`} className={cn("font-display text-2xl font-black", hot && "mt-3")}>{l(p.name)}</h3>
                    <p className={cn("mt-1 text-sm", hot ? "opacity-70" : "text-muted")}>{l(p.tagline)}</p>

                    <div className="mt-6 flex min-h-16 items-baseline gap-2">
                      {free ? (
                        <span className="font-display text-5xl font-black">{t("home2.plans.free")}</span>
                      ) : (
                        <>
                          <MorphPrice value={amount} className="font-display text-5xl font-black" />
                          <motion.span
                            key={period}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn("text-sm", hot ? "opacity-70" : "text-muted")}
                          >
                            {period === "monthly" ? t("home2.plans.perMonth") : t("home2.plans.perYear")}
                          </motion.span>
                        </>
                      )}
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {p.features.map((f, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-3 text-sm"
                          initial={reduce ? false : { opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-8% 0px" }}
                          transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                        >
                          <Check className={cn("mt-0.5 size-4 shrink-0", hot ? "text-volt" : "text-accent")} aria-hidden />
                          <span>{l(f)}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <Button href={free ? "/register" : "/pricing"} variant={hot ? "primary" : "outline"} size="lg" className="mt-8 w-full">
                      {free ? t("home2.plans.ctaFree") : t("home2.plans.ctaPaid")}
                    </Button>
                  </article>
                </div>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-3 text-center">
        <p role="note" className="flex items-start gap-2 rounded-2xl border border-dashed border-coral/60 bg-coral/5 px-4 py-3 text-start text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-coral" aria-hidden />
          <span>{t("home2.plans.note")}</span>
        </p>
        <Button href="/pricing" variant="ghost">
          {t("home2.plans.compare")}
        </Button>
      </div>
    </div>
  );
}
