/**
 * Central data-source configuration. The ONLY place that reads API environment variables.
 *
 *  Demo mode    (default)  → data comes from data/demo/* through the demo service and the local Next.js
 *                            Route Handlers under /api/*. No external backend needed.
 *  Backend mode            → requests go to NEXT_PUBLIC_API_BASE_URL (your real API).
 *
 * Mode is decided at build/start time from env vars — never from user input, query strings or storage.
 * If backend mode is requested but the URL is missing/invalid we fall back to demo mode (the app never crashes).
 */
export type ApiMode = "demo" | "backend";

function sanitizeBaseUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null; // never embed credentials in the URL
    return u.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

/** Public (non-secret) base URL of the real backend, e.g. http://localhost:8000/api */
export const BACKEND_BASE_URL = sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

const demoRequested = process.env.NEXT_PUBLIC_USE_DEMO_API !== "false";

export const API_MODE: ApiMode = !demoRequested && BACKEND_BASE_URL ? "backend" : "demo";
export const IS_DEMO = API_MODE === "demo";

/** Backend requested but unusable → we stay in demo mode and tell developers why. */
export const API_CONFIG_WARNING: string | null =
  !demoRequested && !BACKEND_BASE_URL
    ? "NEXT_PUBLIC_USE_DEMO_API=false but NEXT_PUBLIC_API_BASE_URL is missing or invalid — falling back to demo mode."
    : null;

/** Local Route Handlers (Demo API) live here. Relative so it works on any host/port. */
export const DEMO_API_PATH = "/api";

export const REQUEST_TIMEOUT_MS = 8000;

/** Pagination limits enforced by the demo API (a real backend should enforce its own). */
export const PAGE_SIZE_DEFAULT = 9;
export const PAGE_SIZE_MAX = 50;
