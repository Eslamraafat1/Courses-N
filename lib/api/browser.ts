/**
 * Client-safe API calls (no demo data imported → nothing heavy in the browser bundle).
 * Demo mode → hits the local Route Handlers (/api/*). Backend mode → hits NEXT_PUBLIC_API_BASE_URL.
 */
import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type {
  CourseDTO, CourseListQuery, ContactRequest, FormResultDTO, NewsletterRequest, PageMeta, SearchResultsDTO,
} from "./types";

const csv = (v?: string[]) => (v && v.length ? v.join(",") : undefined);

export async function fetchCoursesPage(q: CourseListQuery, signal?: AbortSignal): Promise<{ items: CourseDTO[]; meta: PageMeta }> {
  const res = await apiRequest<CourseDTO[]>(endpoints.courses, {
    signal,
    query: {
      q: q.q, category: csv(q.category), level: csv(q.level), instructor: csv(q.instructor), duration: csv(q.duration),
      price: q.price, maxPrice: q.maxPrice, minRating: q.minRating, sort: q.sort,
      featured: q.featured, trending: q.trending, new: q.isNew, page: q.page, pageSize: q.pageSize,
    },
  });
  return { items: res.data, meta: res.meta ?? { page: 1, pageSize: res.data.length, total: res.data.length, totalPages: 1 } };
}

export async function searchApi(q: string, signal?: AbortSignal): Promise<SearchResultsDTO> {
  return (await apiRequest<SearchResultsDTO>(endpoints.search, { query: { q }, signal })).data;
}

/** In demo mode the result is always { delivered:false, demo:true } — nothing is emailed or stored. */
export async function submitContact(body: ContactRequest): Promise<FormResultDTO> {
  return (await apiRequest<FormResultDTO>(endpoints.contact, { method: "POST", body })).data;
}
export async function submitNewsletter(body: NewsletterRequest): Promise<FormResultDTO> {
  return (await apiRequest<FormResultDTO>(endpoints.newsletter, { method: "POST", body })).data;
}
