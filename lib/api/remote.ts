import { cacheLife, cacheTag } from "next/cache";
import { apiRequest } from "./client";
import type { ApiEnvelope } from "./types";

type Q = Record<string, string | number | boolean | undefined>;

/**
 * Cached GET against the REAL backend (backend mode only; demo mode never reaches this).
 * `use cache` keeps Cache Components prerendering working and avoids hammering the API;
 * tune lifetime here, or call revalidateTag("api") from a webhook/Server Action after mutations.
 */
export async function remoteGet<T>(path: string, query?: Q): Promise<ApiEnvelope<T>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("api");
  return apiRequest<T>(path, { query });
}
