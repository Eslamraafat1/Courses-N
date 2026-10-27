"use client";
import { useState } from "react";
import { Check, Info, Minus } from "lucide-react";
import type { FaqItem, Plan } from "@/types";
import { compareRows } from "@/data/pricing";
import { Stagger, StaggerItem } from "@/components/animations/Motion";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Badge } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";
const PLAN_IDS = ["free", "pro", "team"] as const;

export function PricingView({ plans, faqs }: { plans: Plan[]; faqs: FaqItem[] }) {
  const { t, l, n } = useI18n();
  const [billing, setBilling] = useState<Billing>("monthly");
  const yearly = billing === "yearly";
  const maxSave = Math.max(0, ...plans.filter((p) => p.price > 0).map((p) => Math.round((1 - p.yearly / (p.price * 12)) * 100)));

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex justify-center">
        <div role="group" aria-label={t("pricing.billing")} className="inline-flex rounded-full border border-line bg-surface p-1">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={billing === b}
              onClick={() => setBilling(b)}
              className={cn("min-h-11 rounded-full px-5 text-sm font-semibold transition-colors", billing === b ? "bg-ink text-bg" : "text-muted hover:text-ink")}
            >
              {t(`pricing.${b}`)}
              {b === "yearly" && maxSave > 0 && <span className="ms-2 rounded-full bg-volt px-2 py-0.5 text-xs font-bold text-volt-ink">{t("pricing.save", { n: n(maxSave) })}</span>}
            </button>
          ))}
        </div>
      </div>

      <Stagger className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
        {plans.map((p) => {
          const monthlyEq = yearly && p.price > 0 ? Math.round(p.yearly / 12) : p.price;
          return (
            <StaggerItem key={p.id} className={cn(p.highlighted && "lg:-my-4")}>
              <section
                aria-labelledby={`plan-${p.id}`}
                className={cn("card relative flex h-full flex-col p-6 sm:p-8", p.highlighted && "border-2 border-accent shadow-2xl")}
              >
                {p.highlighted && <Badge tone="accent" className="absolute -top-3 start-6">{t("pricing.popular")}</Badge>}
                <h2 id={`plan-${p.id}`} className="font-display text-2xl font-bold">{l(p.name)}</h2>
                <p className="mt-1 text-muted">{l(p.tagline)}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="ltr-run font-display text-5xl font-extrabold">${n(monthlyEq)}</span>
                  <span className="text-muted">{t("label.perMonth")}</span>
                </p>
                <p className="mt-1 min-h-6 text-sm text-muted">
                  {p.price === 0 ? t("pricing.freeForever") : yearly ? t("pricing.billedYearly", { price: `$${n(p.yearly)}` }) : t("pricing.billedMonthly")}
                </p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f.en} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                      <span>{l(f)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  {p.price === 0 ? (
                    <Button href="/register" variant="dark" className="w-full">{t("pricing.cta.free")}</Button>
                  ) : (
                    <Button disabled aria-describedby="billing-note" variant={p.highlighted ? "accent" : "outline"} className="w-full">{t("pricing.cta.paid")}</Button>
                  )}
                </div>
              </section>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div id="billing-note" role="note" className="mx-auto mt-12 flex max-w-3xl items-start gap-3 rounded-2xl border border-coral/40 bg-coral/5 p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
        <div>
          <p className="font-semibold">{t("pricing.note.title")}</p>
          <p className="text-sm text-muted">{t("pricing.note.body")}</p>
        </div>
      </div>

      <section className="mt-20" aria-labelledby="compare-h">
        <h2 id="compare-h" className="hd-2 mb-6">{t("pricing.compare.title")}</h2>
        <div className="relative overflow-x-auto rounded-3xl border border-line bg-surface" tabIndex={0} role="region" aria-labelledby="compare-h">
          <table className="w-full min-w-[34rem] border-collapse text-start">
            <caption className="sr-only">{t("pricing.compare.caption")}</caption>
            <thead>
              <tr className="border-b border-line bg-bg2/60">
                <th scope="col" className="p-4 text-start text-sm font-semibold">{t("pricing.compare.feature")}</th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className={cn("p-4 text-center font-display font-bold", p.highlighted && "text-accent")}>{l(p.name)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 text-start font-medium">{l(r.label)}</th>
                  {PLAN_IDS.map((id) => {
                    const v = r.values[id];
                    return (
                      <td key={id} className="p-4 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <>
                              <Check className="mx-auto size-5 text-accent" aria-hidden />
                              <span className="sr-only">{t("pricing.compare.yes")}</span>
                            </>
                          ) : (
                            <>
                              <Minus className="mx-auto size-5 text-muted" aria-hidden />
                              <span className="sr-only">{t("pricing.compare.no")}</span>
                            </>
                          )
                        ) : (
                          <span className="text-sm font-medium">{l(v)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="pfaq-h">
        <h2 id="pfaq-h" className="hd-2 mb-6">{t("pricing.faq.title")}</h2>
        <Accordion items={faqs.map((f) => ({ id: f.id, title: l(f.q), content: <p>{l(f.a)}</p> }))} />
        <p className="mt-6"><Link href="/faq" className="font-semibold text-accent underline underline-offset-4">{t("pricing.faq.more")}</Link></p>
      </section>
    </div>
  );
}
