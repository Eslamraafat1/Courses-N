import type { ApiErrorBody } from "./types";

export type ApiErrorCode =
  | "bad_request"
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "network_error"
  | "timeout"
  | "server_error"
  | "invalid_response";

/** Every failure in the data layer is normalised to this class so the UI can render one Error State. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, string[]>;

  constructor(status: number, code: ApiErrorCode, message: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** transient failures worth a Retry button */
  get retryable() {
    return this.code === "network_error" || this.code === "timeout" || this.status >= 500 || this.status === 429;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export function toApiError(e: unknown): ApiError {
  if (isApiError(e)) return e;
  if (e instanceof DOMException && e.name === "AbortError") return new ApiError(0, "timeout", "Request timed out");
  if (e instanceof TypeError) return new ApiError(0, "network_error", "Network error");
  return new ApiError(500, "server_error", e instanceof Error ? e.message : "Unexpected error");
}

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: "bad_request", 401: "unauthorized", 403: "forbidden", 404: "not_found", 422: "validation_failed", 429: "rate_limited",
};
export const codeForStatus = (s: number): ApiErrorCode => CODE_BY_STATUS[s] ?? (s >= 500 ? "server_error" : "bad_request");

/** Build the standard error JSON body (used by every Route Handler). */
export function errorBody(code: ApiErrorCode, message: string, details?: Record<string, string[]>): ApiErrorBody {
  return { error: { code, message, ...(details ? { details } : {}) } };
}
