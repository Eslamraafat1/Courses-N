import { API_MODE } from "./config";
import { toApiError } from "./errors";

/**
 * Dev-only resilience: in backend mode, if the real API is unreachable (network/timeout/5xx) we fall back to the
 * demo data and log a warning, so the front-end keeps working before the backend exists.
 * In production builds the fallback is OFF unless API_FALLBACK_TO_DEMO=true (server-only variable) so a broken
 * backend is never silently masked by fake data.
 */
const ALLOW_FALLBACK = process.env.NODE_ENV !== "production" || process.env.API_FALLBACK_TO_DEMO === "true";

/** Pick the data source: demo fn in demo mode, otherwise the backend fn (with the dev fallback above). */
export async function source<T>(demo: () => T | Promise<T>, remote: () => Promise<T>): Promise<T> {
  if (API_MODE === "demo") return demo();
  try {
    return await remote();
  } catch (e) {
    const err = toApiError(e);
    if (ALLOW_FALLBACK && err.retryable) {
      console.warn(`[api] backend unavailable (${err.code}) — using demo data instead`);
      return demo();
    }
    throw err;
  }
}
