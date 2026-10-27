"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { Post } from "@/types";
import { formatDate } from "@/lib/i18n/config";
import { Reveal } from "@/components/animations/Motion";
import { Link } from "@/components/ui/Link";
import { Badge, EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

export function BlogIndex({ posts }: { posts: Post[] }) {
  const { t, l, n, lang } = useI18n();
  const [tag, setTag] = useState("all");
  const sorted = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)), [posts]);
  const tags = useMemo(() => [...new Map(sorted.map((p) => [p.tag.en, p.tag])).values()], [sorted]);
  const shown = tag === "all" ? sorted : sorted.filter((p) => p.tag.en === tag);
  const [featured, ...rest] = shown;

  return (
    <div className="container-x py-10 sm:py-14">
      <div role="group" aria-label={t("blog.filter")} className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ key: "all", label: t("label.all") }, ...tags.map((x) => ({ key: x.en, label: l(x) }))].map((x) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={tag === x.key}
            onClick={() => setTag(x.key)}
            className={cn("min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors", tag === x.key ? "border-ink bg-ink text-bg" : "border-line hover:border-ink")}
          >
            {x.label}
          </button>
        ))}
      </div>

      {!featured ? (
        <EmptyState title={t("state.noResults")} body={t("blog.empty")} />
      ) : (
        <>
          <Reveal key={featured.id}>
            <article className="card group relative grid overflow-hidden lg:grid-cols-12">
              <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]">
                <Image src={featured.image} alt="" fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-10 lg:col-span-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="volt">{t("blog.featured")}</Badge>
                  <span className="text-sm font-semibold text-accent">{l(featured.tag)}</span>
                </div>
                <h2 className="hd-2">
                  <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">{l(featured.title)}</Link>
                </h2>
                <p className="text-lg text-muted">{l(featured.excerpt)}</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>{l(featured.author)}</span>
                  <time dateTime={featured.date}>{formatDate(featured.date, lang)}</time>
                  <span className="inline-flex items-center gap-1"><Clock className="size-4" aria-hidden />{t("blog.minRead", { n: n(featured.readMinutes) })}</span>
                </p>
              </div>
            </article>
          </Reveal>

          {rest.length > 0 && (
            <>
              <h2 className="hd-2 mb-6 mt-14">{t("blog.latest")}</h2>
              <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <li key={p.id} className={cn(i % 3 === 1 && "lg:mt-10")}>
                    <Reveal delay={(i % 3) * 0.08}>
                      <article className="group relative">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-bg2">
                          <Image src={p.image} alt="" fill sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-accent">{l(p.tag)}</p>
                        <h3 className="mt-1 font-display text-xl font-bold leading-snug">
                          <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline focus-visible:outline-none">{l(p.title)}</Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 text-muted">{l(p.excerpt)}</p>
                        <p className="mt-3 flex items-center gap-3 text-sm text-muted">
                          <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
                          <span>{t("blog.minRead", { n: n(p.readMinutes) })}</span>
                        </p>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
