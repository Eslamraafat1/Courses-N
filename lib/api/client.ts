import { API_MODE, BACKEND_BASE_URL, DEMO_API_PATH, REQUEST_TIMEOUT_MS } from "./config";
import { ApiError, codeForStatus, toApiError } from "./errors";
import type { ApiEnvelope, ApiErrorBody } from "./types";

type Query = Record<string, string | number | boolean | string[] | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
  /** send/receive the backend's httpOnly session cookie (auth endpoints). Tokens are NEVER kept in JS storage. */
  credentials?: boolean;
  timeoutMs?: number;
}

function baseUrl(): string {
  return API_MODE === "backend" && BACKEND_BASE_URL ? BACKEND_BASE_URL : DEMO_API_PATH;
}

export function buildQuery(query?: Query): string {
  if (!query) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * Typed fetch wrapper → returns the `{ data, meta }` envelope or throws ApiError.
 * Browser: demo → /api (local Route Handlers), backend → NEXT_PUBLIC_API_BASE_URL.
 * The base URL comes from config only; callers cannot override it.
 */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = "GET", query, body, signal, credentials, timeoutMs = REQUEST_TIMEOUT_MS } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${baseUrl()}${path}${buildQuery(query)}`, {
      method,
      headers: { Accept: "application/json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: credentials ? "include" : "same-origin",
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* empty / non-JSON body */
    }

    if (!res.ok) {
      const err = (json as Partial<ApiErrorBody> | null)?.error;
      throw new ApiError(res.status, (err?.code as never) ?? codeForStatus(res.status), err?.message ?? res.statusText ?? "Request failed", err?.details);
    }
    if (json === null || typeof json !== "object" || !("data" in json)) {
      throw new ApiError(502, "invalid_response", "Unexpected response shape from the API");
    }
    return json as ApiEnvelope<T>;
  } catch (e) {
    if (signal?.aborted) throw new ApiError(0, "timeout", "Request aborted");
    throw toApiError(e);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
