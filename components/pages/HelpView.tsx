"use client";
import { useState } from "react";
import { Award, CreditCard, GraduationCap, Rocket, Search, type LucideIcon } from "lucide-react";
import { helpCategories } from "@/data/help";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn, normalize } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { Rocket, GraduationCap, Award, CreditCard };

export function HelpView() {
  const { t, l, n } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const needle = normalize(q);

  const groups = helpCategories
    .filter((c) => cat === "all" || c.id === cat)
    .map((c) => ({ ...c, topics: c.topics.filter((x) => !needle || normalize(`${l(x.q)} ${l(x.a)}`).includes(needle)) }))
    .filter((c) => c.topics.length > 0);
  const total = groups.reduce((s, g) => s + g.topics.length, 0);

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <label htmlFor="help-search" className="sr-only">{t("help.search")}</label>
        <div className="relative">
          <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="help-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("help.searchPlaceholder")}
            className="min-h-14 w-full rounded-full border border-line bg-surface ps-14 pe-5 text-base shadow-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <h2 className="hd-2 mb-5 mt-14">{t("help.categories")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {helpCategories.map((c, i) => {
          const Icon = ICONS[c.icon] ?? Rocket;
          const on = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setCat(on ? "all" : c.id)}
              className={cn("card flex min-h-28 flex-col items-start gap-2 p-5 text-start transition hover:-translate-y-1", i % 2 === 1 && "lg:translate-y-4 lg:hover:translate-y-3", on && "border-accent ring-2 ring-accent/30")}
            >
              <span className="grid size-10 place-items-center rounded-xl bg-volt text-volt-ink"><Icon className="size-5" aria-hidden /></span>
              <span className="font-display font-bold">{l(c.title)}</span>
              <span className="text-sm text-muted">{l(c.description)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {cat !== "all" && (
              <button type="button" onClick={() => setCat("all")} className="me-3 font-semibold text-accent underline underline-offset-4">{t("help.allTopics")}</button>
            )}
            {t("help.results", { n: n(total) })}
          </p>
          {groups.length === 0 ? (
            <EmptyState title={t("state.noResults")} body={t("help.none")} />
          ) : (
            groups.map((g) => (
              <section key={g.id} aria-labelledby={`hc-${g.id}`}>
                <h3 id={`hc-${g.id}`} className="mb-4 font-display text-2xl font-bold">{l(g.title)}</h3>
                <Accordion variant="plain" items={g.topics.map((x) => ({ id: x.id, title: l(x.q), content: <p className="leading-relaxed">{l(x.a)}</p> }))} />
              </section>
            ))
          )}
        </div>
        <aside className="lg:col-span-4">
          <div className="card p-6 lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-bold">{t("help.contactTitle")}</h3>
            <p className="mt-2 text-muted">{t("help.contactBody")}</p>
            <Button href="/contact" className="mt-5">{t("help.contactCta")}</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
