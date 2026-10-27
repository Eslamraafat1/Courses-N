/**
 * Tiny localStorage-backed external store (for useSyncExternalStore).
 * - Never throws: private mode / blocked storage falls back to memory for the current session.
 * - Same-tab and cross-tab updates are both propagated.
 * NOTE: data is per-browser only — nothing is synced between devices.
 */
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const memory = new Map<string, unknown>();
const cache = new Map<string, { raw: string | null; value: unknown }>();
let bound = false;

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function bind() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    memory.delete(e.key);
    emit(e.key);
  });
}

export function readStore<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  if (memory.has(key)) return memory.get(key) as T;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return initial;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = initial;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeStore<T>(key: string, value: T) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    memory.delete(key); // storage works: it is the source of truth again
    cache.delete(key);
  } catch {
    /* storage unavailable: value stays in memory for this session */
  }
  emit(key);
}

export function subscribeStore(key: string, cb: Listener) {
  bind();
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(cb);
  return () => {
    set!.delete(cb);
  };
}
