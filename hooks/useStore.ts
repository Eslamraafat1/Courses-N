"use client";
import { useCallback, useSyncExternalStore } from "react";
import { readStore, subscribeStore, writeStore } from "@/lib/store";

/** `initial` MUST be a stable (module-level) reference. */
export function useStore<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    (cb) => subscribeStore(key, cb),
    () => readStore<T>(key, initial),
    () => initial,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStore<T>(key, initial);
      writeStore(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, initial],
  );
  return [value, set] as const;
}
