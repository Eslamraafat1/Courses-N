"use client";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Reveal, SplitText } from "@/components/animations/Motion";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";
import type { TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/types";

type Group = "all" | FaqItem["group"];
const GROUPS: Group[] = ["all", "general", "learning", "billing"];

/** Plus that turns into a cross: the vertical bar rotates away while the whole mark spins 45deg. */
function PlusCross({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("relative grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-300 motion-reduce:transition-none", open ? "border-transparent bg-volt text-volt-ink" : "border-line bg-bg2")}
    >
      <span className={cn("relative block size-4 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none", open && "rotate-[135deg]")}>
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current" />
        <span className={cn("absolute inset-y-0 start-1/2 w-0.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-500 motion-reduce:transition-none", open && "scale-y-100")} />
      </span>
    </span>
  );
}

export function FaqExplorer({ faqs }: { faqs: FaqItem[] }) {
  const { t, l, n } = useI18n();
  const reduce = useReducedMotion();
  const uid = useId();
  const [group, setGroup] = useState<Group>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set(faqs[0] ? [faqs[0].id] : []));

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => (group === "all" || f.group === group) && (!q || l(f.q).toLowerCase().includes(q) || l(f.a).toLowerCase().includes(q)));
  }, [faqs, group, query, l]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="container-x py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p id="faq-h" className="eyebrow mb-3">{t("home2.faq.eyebrow")}</p>
          </Reveal>
          <SplitText text={t("home2.faq.title")} className="hd-2" />
          <Reveal delay={0.1}>
            <p className="mt-4 text-lg text-muted">{t("home2.faq.lead")}</p>
            <div className="card mt-8 p-6">
              <p className="font-display text-lg font-bold">{t("home2.faq.more")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/faq" variant="dark">{t("home2.faq.viewAll")}</Button>
                <Button href="/contact" variant="outline">{t("home2.faq.contact")}</Button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="min-w-0">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("home2.faq.search")}
              placeholder={t("home2.faq.search")}
              className="min-h-12 w-full rounded-full border border-line bg-surface ps-12 pe-12 text-base outline-offset-2 transition-colors placeholder:text-muted focus:border-ink"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
                  onClick={() => setQuery("")}
                  aria-label={t("act.clearAll")}
                  className="absolute end-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
                >
                  <X className="size-4" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div role="group" aria-label={t("home2.faq.filter")} className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {GROUPS.map((g) => {
              const count = g === "all" ? faqs.length : faqs.filter((f) => f.group === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={group === g}
                  onClick={() => setGroup(g)}
                  className={cn(
                    "relative min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
                    group === g ? "border-transparent text-bg" : "border-line bg-surface text-muted hover:border-ink hover:text-ink",
                  )}
                >
                  {group === g && <motion.span layoutId="faq-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">
                    {t(`home2.faq.group.${g}` as TKey)} <span className="ltr-run opacity-60">{n(count)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="sr-only" aria-live="polite">{t("home2.faq.results", { n: n(items.length) })}</p>

          <ul className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((f, i) => {
                const isOpen = open.has(f.id);
                const bid = `${uid}-b-${f.id}`;
                const pid = `${uid}-p-${f.id}`;
                return (
                  <motion.li
                    key={f.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                    viewport={{ once: true, margin: "-6% 0px" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, delay: Math.min(i, 5) * 0.05 }}
                    className={cn("overflow-hidden rounded-3xl border transition-colors duration-300", isOpen ? "border-ink bg-surface shadow-[var(--shadow)]" : "border-line bg-surface/60 hover:border-ink/60")}
                  >
                    <h3>
                      <button
                        type="button"
                        id={bid}
                        aria-expanded={isOpen}
                        aria-controls={pid}
                        onClick={() => toggle(f.id)}
                        className="flex min-h-16 w-full items-center gap-4 p-4 text-start sm:p-5"
                      >
                        <span aria-hidden className="text-outline ltr-run hidden w-9 shrink-0 font-display text-2xl font-black sm:block">{n(i + 1)}</span>
                        <span className="font-display min-w-0 flex-1 text-lg font-bold leading-snug">{l(f.q)}</span>
                        <PlusCross open={isOpen} />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          id={pid}
                          role="region"
                          aria-labelledby={bid}
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-5 leading-relaxed text-muted sm:px-5 sm:ps-[4.75rem]">{l(f.a)}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <AnimatePresence>
            {items.length === 0 && (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                className="rounded-3xl border border-dashed border-line p-8 text-center text-muted"
              >
                {t("home2.faq.empty")}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
