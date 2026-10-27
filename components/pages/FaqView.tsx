"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import type { FaqItem } from "@/types";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { normalize } from "@/lib/utils";

const GROUPS = ["general", "learning", "billing"] as const;

export function FaqView({ faqs }: { faqs: FaqItem[] }) {
  const { t, l, n } = useI18n();
  const [q, setQ] = useState("");
  const needle = normalize(q);
  const shown = needle ? faqs.filter((f) => normalize(`${l(f.q)} ${l(f.a)}`).includes(needle)) : faqs;

  return (
    <div className="container-x grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <label htmlFor="faq-search" className="mb-2 block text-sm font-semibold">{t("faq.search")}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="faq-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("faq.searchPlaceholder")}
              className="min-h-12 w-full rounded-2xl border border-line bg-surface ps-12 pe-4 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <p className="mt-3 text-sm text-muted" role="status" aria-live="polite">{t("faq.results", { n: n(shown.length) })}</p>
          <nav aria-label={t("nav.faq")} className="mt-6 hidden lg:block">
            <ul className="space-y-1">
              {GROUPS.filter((g) => shown.some((f) => f.group === g)).map((g) => (
                <li key={g}><a href={`#faq-${g}`} className="block rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-bg2 hover:text-ink">{t(`faq.group.${g}`)}</a></li>
              ))}
            </ul>
          </nav>
          <div className="card mt-8 p-5">
            <p className="font-display font-bold">{t("faq.stillTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("faq.stillBody")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href="/help" size="sm" variant="outline">{t("nav.help")}</Button>
              <Button href="/contact" size="sm">{t("nav.contact")}</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 lg:col-span-8">
        {shown.length === 0 ? (
          <EmptyState title={t("state.noResults")} body={t("faq.none")} />
        ) : (
          GROUPS.map((g) => {
            const items = shown.filter((f) => f.group === g);
            if (!items.length) return null;
            return (
              <section key={g} id={`faq-${g}`} aria-labelledby={`faq-${g}-h`} className="scroll-mt-28">
                <h2 id={`faq-${g}-h`} className="hd-2 mb-5">{t(`faq.group.${g}`)}</h2>
                <Accordion items={items.map((f) => ({ id: f.id, title: l(f.q), content: <p className="leading-relaxed">{l(f.a)}</p> }))} />
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
