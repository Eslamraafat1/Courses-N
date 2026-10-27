"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Quote, Search } from "lucide-react";
import type { Testimonial } from "@/types";
import { useI18n } from "@/components/providers/I18nProvider";
import { Reveal, SpotlightCard } from "@/components/animations/Motion";
import { EmptyState } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

/** Searchable, sortable wall of stories with one oversized featured quote. Pure client filtering of server-fetched data. */
export function StoriesView({ stories }: { stories: Testimonial[] }) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"default" | "name">("default");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? stories.filter((s) => [s.name, s.role, s.quote, s.outcome].some((l) => l[lang].toLowerCase().includes(needle)))
      : stories;
    return sort === "name" ? [...filtered].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang)) : filtered;
  }, [stories, q, sort, lang]);

  const [feature, ...rest] = list;
  const sorts = [
    { id: "default", label: t("stories.sort.default") },
    { id: "name", label: t("stories.sort.name") },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="relative w-full max-w-md">
          <label htmlFor="story-search" className="mb-1.5 block text-sm font-semibold">{t("stories.search")}</label>
          <Search className="pointer-events-none absolute start-4 top-[2.75rem] size-5 text-muted" aria-hidden />
          <input
            id="story-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("stories.searchPlaceholder")}
            className="min-h-12 w-full rounded-2xl border border-line bg-surface ps-12 pe-4 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div role="group" aria-label={t("stories.sort")} className="flex gap-2">
          {sorts.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={sort === s.id}
              onClick={() => setSort(s.id)}
              className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors", sort === s.id ? "border-volt bg-volt text-volt-ink" : "border-line hover:border-ink")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="mt-4 text-sm text-muted">{t("stories.count", { n: list.length })}</p>

      {list.length === 0 ? (
        <div className="mt-8"><EmptyState title={t("stories.none")} /></div>
      ) : (
        <LayoutGroup>
          {feature && (
            <Reveal key={feature.id}>
              <figure className="relative mt-8 overflow-hidden rounded-[2rem] bg-ink p-7 text-bg sm:p-12 lg:p-16">
                <Quote aria-hidden className="absolute -end-6 -top-6 size-48 text-bg/[0.06] rtl:-scale-x-100" />
                <p className="eyebrow !text-volt">{t("stories.featured")}</p>
                <blockquote className="mt-5 max-w-4xl font-display text-[clamp(1.5rem,3.8vw,3rem)] font-bold leading-[1.2] tracking-tight">
                  <p>&ldquo;{feature.quote[lang]}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-4">
                  <span className="relative size-14 overflow-hidden rounded-full ring-2 ring-volt">
                    <Image src={feature.avatar} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold">{feature.name[lang]}</span>
                    <span className="block text-bg/70">{feature.role[lang]}</span>
                  </span>
                  <span className="ms-auto rounded-full bg-volt px-4 py-1.5 text-sm font-bold text-volt-ink">
                    {t("stories.outcome")}: {feature.outcome[lang]}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          )}

          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((s, i) => (
              <motion.li layout={!reduce} key={s.id} className="min-w-0">
                <SpotlightCard className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6 sm:p-7">
                  <Quote aria-hidden className={cn("size-8 rtl:-scale-x-100", i % 2 ? "text-coral" : "text-accent")} />
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed">&ldquo;{s.quote[lang]}&rdquo;</blockquote>
                  <p className="mt-5 rounded-xl bg-bg2 px-3 py-2 text-sm"><span className="font-semibold">{t("stories.outcome")}:</span> {s.outcome[lang]}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                      <Image src={s.avatar} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display font-bold">{s.name[lang]}</span>
                      <span className="block truncate text-sm text-muted">{s.role[lang]}</span>
                    </span>
                  </div>
                </SpotlightCard>
              </motion.li>
            ))}
          </ul>
        </LayoutGroup>
      )}
    </div>
  );
}
