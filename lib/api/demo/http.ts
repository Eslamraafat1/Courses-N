import { NextResponse } from "next/server";
import { z } from "zod";
import { errorBody, type ApiErrorCode } from "../errors";
import type { CourseListQuery, PageMeta } from "../types";
import { PAGE_SIZE_MAX } from "../config";

/** Demo API responses are never cached by browsers/CDNs so developers always see current demo data. */
const headers = { "Cache-Control": "no-store", "X-Demo-Api": "true" };

export function ok<T>(data: T, meta?: PageMeta, status = 200) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}), demo: true }, { status, headers });
}

export function fail(status: number, code: ApiErrorCode, message: string, details?: Record<string, string[]>) {
  return NextResponse.json(errorBody(code, message, details), { status, headers });
}

export const notFound = (what: string) => fail(404, "not_found", `${what} not found`);

export function zodFail(err: z.ZodError) {
  return fail(422, "validation_failed", "Invalid request", z.flattenError(err).fieldErrors as Record<string, string[]>);
}

/** Read + validate a JSON body (hard size cap, content-type check). Returns the parsed value or a Response. */
export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S> | Response> {
  if (!req.headers.get("content-type")?.includes("application/json")) return fail(415, "bad_request", "Content-Type must be application/json");
  const raw = await req.text();
  if (raw.length > 10_000) return fail(413, "bad_request", "Payload too large");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "bad_request", "Malformed JSON");
  }
  const parsed = schema.safeParse(json);
  return parsed.success ? parsed.data : zodFail(parsed.error);
}

/* ---------------- validation schemas ---------------- */
const csv = z
  .string()
  .max(300)
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
  .optional();
const bool = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1").optional();
const num = (min: number, max: number) => z.coerce.number().min(min).max(max).optional();

export const courseQuerySchema = z.object({
  q: z.string().max(100).optional(),
  category: csv,
  level: csv.pipe(z.array(z.enum(["beginner", "intermediate", "advanced"])).optional()),
  instructor: csv,
  duration: csv.pipe(z.array(z.enum(["short", "medium", "long"])).optional()),
  price: z.enum(["all", "free", "paid"]).optional(),
  maxPrice: num(0, 10_000),
  minRating: num(0, 5),
  sort: z.enum(["popular", "newest", "rating", "priceAsc", "priceDesc", "duration"]).optional(),
  featured: bool,
  trending: bool,
  new: bool,
  page: z.coerce.number().int().min(1).max(1000).optional(),
  pageSize: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).optional(),
});

export function parseCourseQuery(sp: URLSearchParams): { ok: true; query: CourseListQuery } | { ok: false; res: Response } {
  const raw: Record<string, string> = {};
  sp.forEach((v, k) => {
    raw[k] = v;
  });
  const r = courseQuerySchema.safeParse(raw);
  if (!r.success) return { ok: false, res: zodFail(r.error) };
  const { new: isNew, ...rest } = r.data;
  return { ok: true, query: { ...rest, isNew } as CourseListQuery };
}

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(2000),
});
export const newsletterSchema = z.object({ email: z.string().trim().email().max(200) });
export const searchSchema = z.object({ q: z.string().trim().min(1).max(100) });
