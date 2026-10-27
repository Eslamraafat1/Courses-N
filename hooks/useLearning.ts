"use client";
import { useCallback, useMemo } from "react";
import { useStore } from "./useStore";
import { demoStudent } from "@/data/content";

const EMPTY_LIST: string[] = [];
const EMPTY_MAP: Record<string, string> = {};
const EMPTY_NOTES: Record<string, string> = {};

/** Wishlist of course slugs (localStorage — per-browser only). */
export function useWishlist() {
  const [list, setList] = useStore<string[]>("nx-wishlist", EMPTY_LIST);
  const has = useCallback((slug: string) => list.includes(slug), [list]);
  /** returns true when the course is now in the wishlist */
  const toggle = useCallback(
    (slug: string) => {
      const next = !list.includes(slug);
      setList(next ? [...list, slug] : list.filter((s) => s !== slug));
      return next;
    },
    [list, setList],
  );
  return { list, has, toggle };
}

/** Recently viewed course slugs (most recent first, max 10). */
export function useRecent() {
  const [list, setList] = useStore<string[]>("nx-recent", EMPTY_LIST);
  const push = useCallback(
    (slug: string) => setList((prev) => (prev[0] === slug ? prev : [slug, ...prev.filter((s) => s !== slug)].slice(0, 10))),
    [setList],
  );
  const clear = useCallback(() => setList([]), [setList]);
  return { list, push, clear };
}

export function useRecentSearches() {
  const [list, setList] = useStore<string[]>("nx-searches", EMPTY_LIST);
  const push = useCallback(
    (q: string) => {
      const t = q.trim();
      if (t.length < 2) return;
      setList((prev) => [t, ...prev.filter((s) => s !== t)].slice(0, 6));
    },
    [setList],
  );
  const clear = useCallback(() => setList([]), [setList]);
  return { list, push, clear };
}

const SEED = demoStudent.seedProgress;
type ProgressMap = Record<string, string[]>;
/** Sentinel meaning "nothing saved yet" → show the labelled demo seed. */
const NO_PROGRESS: ProgressMap = {};

/**
 * Completed lesson ids per course slug. Until the learner completes something, a clearly-labelled demo seed
 * is used so “Continue learning” has content. Stored locally only (not synced between devices).
 */
export function useProgress() {
  const [stored, setStored] = useStore<ProgressMap>("nx-progress", NO_PROGRESS);
  const isSeed = Object.keys(stored).length === 0;
  const map: ProgressMap = isSeed ? SEED : stored;

  const completed = useCallback((slug: string) => map[slug] ?? EMPTY_LIST, [map]);
  const isDone = useCallback((slug: string, lessonId: string) => (map[slug] ?? EMPTY_LIST).includes(lessonId), [map]);
  const toggleLesson = useCallback(
    (slug: string, lessonId: string) => {
      const cur = map[slug] ?? [];
      const wasDone = cur.includes(lessonId);
      const next = wasDone ? cur.filter((x) => x !== lessonId) : [...cur, lessonId];
      setStored({ ...map, [slug]: next });
      return !wasDone;
    },
    [map, setStored],
  );
  const percent = useCallback(
    (slug: string, total: number) => (total > 0 ? Math.min(100, Math.round(((map[slug] ?? EMPTY_LIST).length / total) * 100)) : 0),
    [map],
  );
  return { map, isSeed, completed, isDone, toggleLesson, percent };
}

/** Last opened lesson per course (resume learning). */
export function useLastLesson() {
  const [map, setMap] = useStore<Record<string, string>>("nx-last-lesson", EMPTY_MAP);
  const set = useCallback((slug: string, lessonId: string) => setMap((p) => (p[slug] === lessonId ? p : { ...p, [slug]: lessonId })), [setMap]);
  return { map, set };
}

export function useNotes() {
  const [notes, setNotes] = useStore<Record<string, string>>("nx-notes", EMPTY_NOTES);
  const set = useCallback((lessonId: string, text: string) => setNotes((p) => ({ ...p, [lessonId]: text })), [setNotes]);
  return { notes, set };
}

export function useReadNotifications() {
  const [read, setRead] = useStore<string[]>("nx-notif-read", EMPTY_LIST);
  const markAll = useCallback((ids: string[]) => setRead(ids), [setRead]);
  const mark = useCallback((id: string) => setRead((p) => (p.includes(id) ? p : [...p, id])), [setRead]);
  const set = useMemo(() => new Set(read), [read]);
  return { read: set, mark, markAll };
}

export interface LearningPrefs {
  dailyMinutes: number;
  goal: string;
  reminders: boolean;
  autoplay: boolean;
  topics: string[];
}
const DEFAULT_PREFS: LearningPrefs = { dailyMinutes: 30, goal: "career", reminders: true, autoplay: true, topics: ["programming"] };
export function usePrefs() {
  const [prefs, setPrefs] = useStore<LearningPrefs>("nx-prefs", DEFAULT_PREFS);
  const update = useCallback((patch: Partial<LearningPrefs>) => setPrefs((p) => ({ ...p, ...patch })), [setPrefs]);
  return { prefs, update };
}
