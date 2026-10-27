"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import type { CourseSummary, SearchEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import { useRecentSearches } from "@/hooks/useLearning";
import { matchEntries, matchesText, relevance, tokens } from "@/lib/catalog";
import { CourseCard } from "./CourseCard";
import { QuickView, thumbLayoutId } from "./QuickView";

const MAX_COURSES = 12;
const HREF: Record<SearchEntry["type"], string> = { course: "/courses", instructor: "/instructors", category: "/categories", path: "/paths" };

interface Props {
  courses: CourseSummary[];
  /** instructors / categories / paths only */
  entries: SearchEntry[];
  suggestions: string[];
}

export function SearchResults({ courses, entries, suggestions }: Props) {
  const { t, l, n } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const recent = useRecentSearches();
  const [quick, setQuick] = useState<CourseSummary | null>(null);

  /* input stays in sync with ?q= (also for back/forward) without clobbering what the user is typing */
  const [value, setValue] = useState(q);
  const typed = useRef(q);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (q !== typed.current.trim()) {
      typed.current = q;
      setValue(q);
    }
  }, [q]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const go = (next: string) => {
    const s = next.trim();
    router.replace(s ? `${pathname}?q=${encodeURIComponent(s)}` : pathname, { scroll: false });
  };
  const onChange = (v: string) => {
    setValue(v);
    typed.current = v;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => go(v), 350);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.clearTimeout(timer.current);
    recent.push(value);
    go(value);
  };
  const pick = (term: string) => {
    setValue(term);
    typed.current = term;
    recent.push(term);
    go(term);
  };

  const found = useMemo(() => {
    const toks = tokens(q);
    if (!toks.length) return null;
    const cs = courses.filter((c) => matchesText(c, toks)).sort((a, b) => relevance(b, q) - relevance(a, q));
    return {
      courses: cs,
      instructors: matchEntries(entries, q, "instructor"),
      categories: matchEntries(entries, q, "category"),
      paths: matchEntries(entries, q, "path"),
    };
  }, [q, courses, entries]);

  const total = found ? found.courses.length + found.instructors.length + found.categories.length + found.paths.length : 0;

  const chip = (term: string, icon?: boolean) => (
    <li key={term}>
      <button
        type="button"
        onClick={() => pick(term)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium transition hover:border-ink"
      >
        {icon && <Clock className="size-4 text-muted" aria-hidden />}
        {term}
      </button>
    </li>
  );

  const entryGroup = (title: string, list: SearchEntry[]) =>
    list.length > 0 && (
      <section aria-label={title} className="mt-12">
        <h2 className="hd-2 mb-5 !text-2xl">{title}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <li key={e.id}>
              <Link href={`${HREF[e.type]}/${e.slug}`} className="card group flex min-h-20 items-center gap-4 p-3 transition hover:-translate-y-0.5">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-bg2">
                  {e.image && <Image src={e.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-bold group-hover:text-accent">{l(e.title)}</span>
                  <span className="line-clamp-2 text-sm text-muted">{l(e.subtitle)}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted rtl-flip" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="container-x py-10 sm:py-14">
      <form role="search" onSubmit={submit} className="mx-auto flex max-w-3xl gap-3">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="search-q" className="sr-only">{t("searchPage.label")}</label>
          <Search className="pointer-events-none absolute start-5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="search-q"
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("searchPage.placeholder")}
            autoComplete="off"
            enterKeyHint="search"
            className="min-h-14 w-full rounded-full border border-line bg-surface ps-14 pe-12 text-lg text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {value && (
            <button type="button" aria-label={t("act.close")} onClick={() => pick("")} className="absolute end-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-bg2 hover:text-ink">
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <Button type="submit" size="lg" className="shrink-0">{t("searchPage.submit")}</Button>
      </form>

      <p role="status" aria-live="polite" className="mt-8 text-center text-sm font-semibold text-muted">
        {found ? t("searchPage.total", { n: n(total), q }) : ""}
      </p>

      {!found ? (
        <div className="mx-auto mt-6 max-w-3xl">
          {recent.list.length > 0 && (
            <section aria-labelledby="recent-h" className="mb-10">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id="recent-h" className="font-display text-lg font-bold">{t("searchPage.recent")}</h2>
                <button type="button" onClick={recent.clear} className="min-h-11 text-sm font-semibold text-accent underline-offset-4 hover:underline">{t("searchPage.clearRecent")}</button>
              </div>
              <ul className="flex flex-wrap gap-2">{recent.list.map((s) => chip(s, true))}</ul>
            </section>
          )}
          <EmptyState
            icon={<Search className="size-7" aria-hidden />}
            title={t("searchPage.start.title")}
            body={t("searchPage.start.body")}
            action={
              <div>
                <h2 className="mb-3 text-sm font-semibold text-muted">{t("searchPage.suggestions")}</h2>
                <ul className="flex flex-wrap justify-center gap-2">{suggestions.map((s) => chip(s))}</ul>
              </div>
            }
          />
        </div>
      ) : total === 0 ? (
        <div className="mx-auto mt-6 max-w-3xl">
          <EmptyState
            title={t("searchPage.none.title", { q })}
            body={t("searchPage.none.body")}
            action={
              <div>
                <h2 className="mb-3 text-sm font-semibold text-muted">{t("searchPage.suggestions")}</h2>
                <ul className="flex flex-wrap justify-center gap-2">{suggestions.map((s) => chip(s))}</ul>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {found.courses.length > 0 && (
            <section aria-label={t("searchPage.courses")} className="mt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 className="hd-2 !text-2xl">
                  {t("searchPage.courses")} <span className="ltr-run text-muted">({n(found.courses.length)})</span>
                </h2>
                <Link href={`/courses?q=${encodeURIComponent(q)}`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">
                  {t("searchPage.openInCatalog")} <ArrowRight className="size-4 rtl-flip" aria-hidden />
                </Link>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {found.courses.slice(0, MAX_COURSES).map((c) => (
                  <li key={c.slug} className="flex min-w-0 [&>article]:w-full">
                    <CourseCard course={c} layoutId={thumbLayoutId(c.slug)} onThumbClick={setQuick} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {entryGroup(t("searchPage.instructors"), found.instructors)}
          {entryGroup(t("searchPage.categories"), found.categories)}
          {entryGroup(t("searchPage.paths"), found.paths)}
        </>
      )}
      <QuickView course={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
