/**
 * Catalog engine: pure functions (no React) for filtering, sorting and (de)serialising the
 * state of the course catalog to URL query params.
 */
import type { CourseSummary, L, Level, SearchEntry } from "@/types";
import { normalize } from "@/lib/utils";

export const SORTS = ["popular", "newest", "rating", "priceAsc", "priceDesc", "duration"] as const;
export type SortKey = (typeof SORTS)[number];
export const DURATIONS = ["short", "medium", "long"] as const;
export type DurationKey = (typeof DURATIONS)[number];
export const LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced"] as const;
export type PriceMode = "all" | "free" | "paid";
export type ViewMode = "grid" | "list";
export const RATING_STEPS = [0, 4, 4.5, 4.8] as const;

export interface CatalogState {
  q: string;
  categories: string[];
  levels: Level[];
  instructors: string[];
  durations: DurationKey[];
  price: PriceMode;
  /** null = no upper bound */
  maxPrice: number | null;
  minRating: number;
  sort: SortKey;
  view: ViewMode;
}

export interface CatalogCategory {
  slug: string;
  name: L;
  color: string;
}
export interface CatalogInstructor {
  slug: string;
  name: L;
}

export const baseState: CatalogState = {
  q: "",
  categories: [],
  levels: [],
  instructors: [],
  durations: [],
  price: "all",
  maxPrice: null,
  minRating: 0,
  sort: "popular",
  view: "grid",
};

/** Build the defaults for a catalog instance (e.g. trending => sort popular, category page => locked category). */
export function makeDefaults(over: Partial<CatalogState> = {}): CatalogState {
  return { ...baseState, ...over };
}

export function durationBucket(hours: number): DurationKey {
  return hours < 8 ? "short" : hours <= 14 ? "medium" : "long";
}

/* ---------- URL <-> state ---------- */

interface ParamReader {
  get(key: string): string | null;
}

const csv = (v: string | null): string[] => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export function parseState(sp: ParamReader, defaults: CatalogState): CatalogState {
  const sort = sp.get("sort");
  const view = sp.get("view");
  const price = sp.get("price");
  const max = Number(sp.get("max"));
  const rating = Number(sp.get("rating"));
  const has = (k: string) => sp.get(k) !== null;
  return {
    q: sp.get("q") ?? defaults.q,
    categories: has("cat") ? csv(sp.get("cat")) : defaults.categories,
    levels: has("level") ? csv(sp.get("level")).filter((x): x is Level => (LEVELS as readonly string[]).includes(x)) : defaults.levels,
    instructors: has("ins") ? csv(sp.get("ins")) : defaults.instructors,
    durations: has("dur") ? csv(sp.get("dur")).filter((x): x is DurationKey => (DURATIONS as readonly string[]).includes(x)) : defaults.durations,
    price: price === "free" || price === "paid" || price === "all" ? price : defaults.price,
    maxPrice: sp.get("max") !== null && Number.isFinite(max) && max >= 0 ? max : defaults.maxPrice,
    minRating: sp.get("rating") !== null && Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : defaults.minRating,
    sort: sort && (SORTS as readonly string[]).includes(sort) ? (sort as SortKey) : defaults.sort,
    view: view === "list" || view === "grid" ? view : defaults.view,
  };
}

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Only values that differ from the defaults are written, so URLs stay short and shareable. */
export function toParams(s: CatalogState, d: CatalogState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.q.trim() !== d.q) p.set("q", s.q);
  if (!sameList(s.categories, d.categories) && s.categories.length) p.set("cat", s.categories.join(","));
  if (s.levels.length) p.set("level", s.levels.join(","));
  if (s.instructors.length) p.set("ins", s.instructors.join(","));
  if (s.durations.length) p.set("dur", s.durations.join(","));
  if (s.price !== d.price) p.set("price", s.price);
  if (s.maxPrice !== d.maxPrice && s.maxPrice !== null) p.set("max", String(s.maxPrice));
  if (s.minRating !== d.minRating && s.minRating > 0) p.set("rating", String(s.minRating));
  if (s.sort !== d.sort) p.set("sort", s.sort);
  if (s.view !== d.view) p.set("view", s.view);
  return p;
}

/** Number of active filters (excluding sort/view and anything locked by the defaults). */
export function countActive(s: CatalogState, d: CatalogState): number {
  return (
    (s.q.trim() ? 1 : 0) +
    (sameList(s.categories, d.categories) ? 0 : s.categories.length) +
    s.levels.length +
    s.instructors.length +
    s.durations.length +
    (s.price !== d.price ? 1 : 0) +
    (s.maxPrice !== null && s.maxPrice !== d.maxPrice ? 1 : 0) +
    (s.minRating > 0 ? 1 : 0)
  );
}

/** Patch that resets every filter (not sort / view) to the defaults. */
export function clearPatch(d: CatalogState): Partial<CatalogState> {
  return {
    q: d.q,
    categories: d.categories,
    levels: [],
    instructors: [],
    durations: [],
    price: d.price,
    maxPrice: d.maxPrice,
    minRating: d.minRating,
  };
}

/* ---------- search ---------- */

const hayCache = new WeakMap<CourseSummary, string>();

function haystack(c: CourseSummary): string {
  const hit = hayCache.get(c);
  if (hit) return hit;
  const h = normalize(
    [
      c.title.ar, c.title.en, c.subtitle.ar, c.subtitle.en, c.instructor.name.ar, c.instructor.name.en,
      c.category.name.ar, c.category.name.en, ...c.tags,
    ].join(" | "),
  );
  hayCache.set(c, h);
  return h;
}

export function tokens(q: string): string[] {
  return normalize(q).split(/\s+/).filter(Boolean);
}

export function matchesText(c: CourseSummary, toks: string[]): boolean {
  if (!toks.length) return true;
  const h = haystack(c);
  return toks.every((t) => h.includes(t));
}

/** Higher is better; title hits outrank subtitle / tag / instructor hits. */
export function relevance(c: CourseSummary, q: string): number {
  const toks = tokens(q);
  if (!toks.length) return 0;
  const title = normalize(`${c.title.ar} ${c.title.en}`);
  const tags = normalize(c.tags.join(" "));
  let score = 0;
  for (const t of toks) {
    if (title.includes(t)) score += 10;
    if (title.startsWith(t)) score += 4;
    if (tags.includes(t)) score += 5;
    if (normalize(`${c.instructor.name.ar} ${c.instructor.name.en}`).includes(t)) score += 3;
    if (normalize(`${c.category.name.ar} ${c.category.name.en}`).includes(t)) score += 2;
  }
  return score + c.rating / 10;
}

export function matchEntries(entries: SearchEntry[], q: string, type: SearchEntry["type"]): SearchEntry[] {
  const toks = tokens(q);
  if (!toks.length) return [];
  return entries.filter((e) => {
    if (e.type !== type) return false;
    const h = normalize(`${e.title.ar} ${e.title.en} ${e.subtitle.ar} ${e.subtitle.en}`);
    return toks.every((t) => h.includes(t));
  });
}

/* ---------- filter + sort ---------- */

const sorters: Record<SortKey, (a: CourseSummary, b: CourseSummary) => number> = {
  popular: (a, b) => b.students - a.students,
  newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  duration: (a, b) => a.duration - b.duration,
};

export function filterCourses(courses: readonly CourseSummary[], s: CatalogState): CourseSummary[] {
  const toks = tokens(s.q);
  const out = courses.filter((c) => {
    if (!matchesText(c, toks)) return false;
    if (s.categories.length && !s.categories.includes(c.category.slug)) return false;
    if (s.levels.length && !s.levels.includes(c.level)) return false;
    if (s.instructors.length && !s.instructors.includes(c.instructor.slug)) return false;
    if (s.durations.length && !s.durations.includes(durationBucket(c.duration))) return false;
    if (s.price === "free" && c.price !== 0) return false;
    if (s.price === "paid" && c.price === 0) return false;
    if (s.maxPrice !== null && c.price > s.maxPrice) return false;
    if (c.rating < s.minRating) return false;
    return true;
  });
  const cmp = sorters[s.sort];
  return out.sort((a, b) => cmp(a, b) || b.students - a.students);
}

/** Facet counts computed on the unfiltered list (stable numbers next to each option). */
export function facetCounts(courses: readonly CourseSummary[]) {
  const category: Record<string, number> = {};
  const instructor: Record<string, number> = {};
  const level: Record<string, number> = {};
  const duration: Record<string, number> = {};
  for (const c of courses) {
    category[c.category.slug] = (category[c.category.slug] ?? 0) + 1;
    instructor[c.instructor.slug] = (instructor[c.instructor.slug] ?? 0) + 1;
    level[c.level] = (level[c.level] ?? 0) + 1;
    const d = durationBucket(c.duration);
    duration[d] = (duration[d] ?? 0) + 1;
  }
  return { category, instructor, level, duration };
}

/** Distinct categories / instructors actually present in a list of courses. */
export function facetsOf(courses: readonly CourseSummary[]): { categories: CatalogCategory[]; instructors: CatalogInstructor[] } {
  const cats = new Map<string, CatalogCategory>();
  const ins = new Map<string, CatalogInstructor>();
  for (const c of courses) {
    cats.set(c.category.slug, { slug: c.category.slug, name: c.category.name, color: c.category.color });
    ins.set(c.instructor.slug, { slug: c.instructor.slug, name: c.instructor.name });
  }
  return { categories: [...cats.values()], instructors: [...ins.values()] };
}
