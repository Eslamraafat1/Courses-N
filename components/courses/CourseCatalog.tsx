"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { CourseSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  SORTS, clearPatch, countActive, facetCounts, filterCourses, makeDefaults, parseState, toParams,
  type CatalogCategory, type CatalogInstructor, type CatalogState, type SortKey,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { CourseCard } from "./CourseCard";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogErrorBoundary, CatalogSkeleton } from "./CatalogParts";
import { QuickView, thumbLayoutId } from "./QuickView";

const PAGE_SIZE = 9;

interface Props {
  courses: CourseSummary[];
  categories: CatalogCategory[];
  instructors: CatalogInstructor[];
  lockedCategory?: string;
  defaultSort?: SortKey;
}

interface Chip {
  id: string;
  label: string;
  patch: Partial<CatalogState>;
}

export function CourseCatalog(props: Props) {
  // key: Retry on the error boundary remounts the whole catalog
  const [epoch, setEpoch] = useState(0);
  return (
    <CatalogErrorBoundary onReset={() => setEpoch((e) => e + 1)}>
      <Inner key={epoch} {...props} />
    </CatalogErrorBoundary>
  );
}

function Inner({ courses, categories, instructors, lockedCategory, defaultSort = "popular" }: Props) {
  const { t, l, n } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const defaults = useMemo(
    () => makeDefaults({ sort: defaultSort, categories: lockedCategory ? [lockedCategory] : [] }),
    [defaultSort, lockedCategory],
  );
  const state = useMemo<CatalogState>(() => {
    const s = parseState(sp, defaults);
    return lockedCategory ? { ...s, categories: [lockedCategory] } : s;
  }, [sp, defaults, lockedCategory]);

  /* ---- URL sync ---- */
  const update = useCallback(
    (patch: Partial<CatalogState>) => {
      const next = { ...state, ...patch };
      const qs = toParams(next, defaults).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [state, defaults, router, pathname],
  );
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });

  /* ---- search box (debounced into the URL) ---- */
  const [qInput, setQInput] = useState(state.q);
  const typed = useRef(state.q);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (state.q !== typed.current) {
      typed.current = state.q;
      setQInput(state.q);
    }
  }, [state.q]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onQ = (v: string) => {
    setQInput(v);
    typed.current = v;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => updateRef.current({ q: v }), 250);
  };

  /* ---- simulated first load ---- */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(id);
  }, []);

  /* ---- results ---- */
  const results = useMemo(() => filterCourses(courses, state), [courses, state]);
  const counts = useMemo(() => facetCounts(courses), [courses]);
  const priceBound = useMemo(() => Math.max(10, Math.ceil(Math.max(0, ...courses.map((c) => c.price)) / 5) * 5), [courses]);
  const active = countActive(state, defaults);

  const sig = sp.toString();
  const [more, setMore] = useState({ sig: "", extra: 0 });
  const extra = more.sig === sig ? more.extra : 0;
  const shown = results.slice(0, PAGE_SIZE + extra);

  /* ---- chips ---- */
  const chips: Chip[] = [];
  if (state.q.trim()) chips.push({ id: "q", label: t("catalog.chip.search", { q: state.q.trim() }), patch: { q: "" } });
  if (!lockedCategory)
    for (const slug of state.categories) {
      const c = categories.find((x) => x.slug === slug);
      if (c) chips.push({ id: `c-${slug}`, label: l(c.name), patch: { categories: state.categories.filter((x) => x !== slug) } });
    }
  for (const lv of state.levels) chips.push({ id: `l-${lv}`, label: t(`level.${lv}`), patch: { levels: state.levels.filter((x) => x !== lv) } });
  for (const d of state.durations) chips.push({ id: `d-${d}`, label: t(`catalog.duration.${d}`), patch: { durations: state.durations.filter((x) => x !== d) } });
  for (const slug of state.instructors) {
    const i = instructors.find((x) => x.slug === slug);
    if (i) chips.push({ id: `i-${slug}`, label: l(i.name), patch: { instructors: state.instructors.filter((x) => x !== slug) } });
  }
  if (state.price !== "all") chips.push({ id: "p", label: t(`catalog.price.${state.price}`), patch: { price: "all" } });
  if (state.maxPrice !== null) chips.push({ id: "mp", label: t("catalog.chip.price", { n: `$${n(state.maxPrice)}` }), patch: { maxPrice: null } });
  if (state.minRating > 0) chips.push({ id: "r", label: t("catalog.chip.rating", { n: state.minRating.toFixed(1) }), patch: { minRating: 0 } });

  /* ---- sheet (mobile / tablet) with a draft copy ---- */
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<CatalogState>(state);
  const openSheet = () => {
    setDraft(state);
    setSheet(true);
  };
  const applyDraft = () => {
    update({
      categories: draft.categories, levels: draft.levels, instructors: draft.instructors, durations: draft.durations,
      price: draft.price, maxPrice: draft.maxPrice, minRating: draft.minRating,
    });
    setSheet(false);
  };

  /* ---- quick view ---- */
  const [quick, setQuick] = useState<CourseSummary | null>(null);

  const clearAll = () => {
    update(clearPatch(defaults));
    setQInput("");
    typed.current = "";
  };

  const removeChip = (c: Chip) => {
    if (c.id === "q") {
      setQInput("");
      typed.current = "";
    }
    update(c.patch);
  };

  const filterProps = { categories, instructors, counts, priceBound, lockedCategory: !!lockedCategory };
  const isList = state.view === "list";

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <label htmlFor="catalog-q" className="sr-only">{t("catalog.search.label")}</label>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="catalog-q"
            type="search"
            value={qInput}
            onChange={(e) => onQ(e.target.value)}
            placeholder={t("catalog.search.placeholder")}
            autoComplete="off"
            className="min-h-12 w-full rounded-full border border-line bg-surface ps-12 pe-4 text-base text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="catalog-sort" className="sr-only">{t("sort.label")}</label>
          <select
            id="catalog-sort"
            value={state.sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className="min-h-12 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>{t(`sort.${s}`)}</option>
            ))}
          </select>

          <div role="group" aria-label={t("catalog.view.label")} className="flex rounded-full border border-line bg-surface p-1">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={state.view === v}
                aria-label={t(`catalog.view.${v}`)}
                title={t(`catalog.view.${v}`)}
                onClick={() => update({ view: v })}
                className={cn("grid size-10 place-items-center rounded-full transition", state.view === v ? "bg-ink text-bg" : "text-muted hover:text-ink")}
              >
                {v === "grid" ? <LayoutGrid className="size-4" aria-hidden /> : <List className="size-4" aria-hidden />}
              </button>
            ))}
          </div>

          <Button variant="outline" onClick={openSheet} className="lg:hidden" aria-haspopup="dialog" icon={<SlidersHorizontal className="size-4" aria-hidden />}>
            {t("catalog.filters.open")}
            {active > 0 && (
              <span className="ltr-run grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-ink" aria-label={n(active)}>
                {n(active)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* count + chips */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p role="status" aria-live="polite" className="text-sm font-semibold">
          {ready ? (results.length === 1 ? t("catalog.count.one") : t("catalog.count", { n: n(results.length) })) : t("catalog.loading")}
        </p>
        {chips.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2" aria-label={t("catalog.filters.title")}>
            {chips.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => removeChip(c)}
                  aria-label={t("catalog.chip.remove", { name: c.label })}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface ps-3.5 pe-2.5 text-sm hover:border-ink"
                >
                  {c.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="min-h-9 rounded-full px-3 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                {t("act.clearAll")}
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
        {/* sidebar */}
        <aside className="hidden lg:block" aria-label={t("catalog.filters.title")}>
          <div data-lenis-prevent className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-line bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">{t("catalog.filters.title")}</h2>
              {active > 0 && (
                <button type="button" onClick={clearAll} className="min-h-9 text-sm font-semibold text-accent underline-offset-4 hover:underline">
                  {t("catalog.filters.clear")}
                </button>
              )}
            </div>
            <CatalogFilters state={state} onChange={update} {...filterProps} />
          </div>
        </aside>

        {/* results */}
        <div className="min-w-0">
          {!ready ? (
            <CatalogSkeleton list={isList} />
          ) : results.length === 0 ? (
            <EmptyState
              title={t("catalog.empty.title")}
              body={t("catalog.empty.body")}
              action={<Button variant="dark" onClick={clearAll}>{t("catalog.filters.clear")}</Button>}
            />
          ) : (
            <>
              <ul className={cn("grid gap-5", isList ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3")}>
                {shown.map((c, i) => (
                  <li key={c.slug} className="flex min-w-0 [&>article]:w-full">
                    <CourseCard
                      course={c}
                      variant={isList ? "horizontal" : "grid"}
                      layoutId={thumbLayoutId(c.slug)}
                      onThumbClick={setQuick}
                      priority={i < 3}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm text-muted">{t("catalog.showing", { shown: n(shown.length), total: n(results.length) })}</p>
                {shown.length < results.length && (
                  <Button variant="outline" size="lg" onClick={() => setMore({ sig, extra: extra + PAGE_SIZE })}>
                    {t("catalog.loadMore")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* bottom sheet */}
      <Modal open={sheet} onClose={() => setSheet(false)} label={t("catalog.sheet.label")} variant="bottom">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 pe-16">
            <h2 className="font-display text-lg font-bold">{t("catalog.filters.title")}</h2>
          </div>
          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <CatalogFilters state={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} {...filterProps} />
          </div>
          <div className="flex gap-3 border-t border-line bg-surface p-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDraft((d) => ({ ...d, ...clearPatch(defaults), q: d.q }))}
            >
              {t("catalog.filters.clear")}
            </Button>
            <Button variant="primary" className="flex-1" onClick={applyDraft}>
              {t("catalog.filters.apply")}
            </Button>
          </div>
        </div>
      </Modal>

      <QuickView course={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
