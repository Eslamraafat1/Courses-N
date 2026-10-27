# Backend Integration Guide (PROPOSED contract)

> **Status: proposal.** This contract was written by the front-end team to make integration easy. It is **not** an agreed, final API.
> Please review it with the backend developer and change it freely — only `lib/api/types.ts`, `lib/api/endpoints.ts` and
> `lib/api/mappers.ts` need to follow any change; UI components do not.

## 1. Modes

| | Demo mode (default) | Backend mode |
|---|---|---|
| Data | `data/demo/*` through `lib/api/demo/service.ts` | Real API |
| HTTP | Local Next.js Route Handlers `app/api/*` (browser requests) / direct calls (server) | `NEXT_PUBLIC_API_BASE_URL` |
| Enable | `NEXT_PUBLIC_USE_DEMO_API=true` (or unset) | `NEXT_PUBLIC_USE_DEMO_API=false` **and** a valid `NEXT_PUBLIC_API_BASE_URL` |

If backend mode is requested but the URL is missing/invalid the app **falls back to demo mode** (never crashes). The base URL is read **only** from env at build/start time; no user input can change it.

### Environment variables (`.env.example`)
| Name | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_USE_DEMO_API` | `true` | `false` switches to backend mode |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | public; no trailing slash; **no secrets** |
| `NEXT_PUBLIC_SITE_URL` | `https://academy.example.com` | canonical URLs / sitemap |

## 2. Switching from Demo to Backend
1. Implement the endpoints below (or adapt `lib/api/endpoints.ts` + `lib/api/types.ts` + `lib/api/mappers.ts` to your shapes).
2. Set `NEXT_PUBLIC_USE_DEMO_API=false` and `NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api`.
3. Configure CORS (§9) and cookies (§8).
4. Add the API image/video hosts to `images.remotePatterns` in `next.config.ts` (currently `images.unsplash.com`, `i.ytimg.com`).
5. Run `npm run build`. No page/component code changes are required.
Server-side reads in backend mode are cached with `use cache` (`lib/api/remote.ts`, tag `api`, lifetime “minutes”). After a mutation call `revalidateTag("api")`.

## 3. Conventions
* JSON, UTF-8. Bilingual text is `{ "ar": "...", "en": "..." }`. Dates ISO-8601. Money = number (USD), `0` = free.
* `idOrSlug` path params accept either the `id` or the unique `slug`.
* Success: `{ "data": <T>, "meta"?: PageMeta }` · Error: see §6.

## 4. Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/courses` | list, filter, sort, paginate |
| GET | `/courses/{idOrSlug}` | course with `modules[].lessons[]` |
| GET | `/courses/{idOrSlug}/lessons` | `ModuleDTO[]` |
| GET | `/courses/{idOrSlug}/reviews` | `ReviewDTO[]` |
| GET | `/categories` | `CategoryDTO[]` |
| GET | `/instructors` | `InstructorDTO[]` |
| GET | `/instructors/{idOrSlug}` | `InstructorDTO` |
| GET | `/search?q=` | `{ query, courses, instructors, categories }` |
| POST | `/contact` | contact form |
| POST | `/newsletter` | newsletter sign-up |
| POST | `/auth/login` · `/auth/register` · `/auth/logout` · `GET /auth/session` · `/auth/forgot-password` · `/auth/reset-password` | session auth (cookie) |

### `GET /courses` query parameters
| Param | Type | Notes |
|---|---|---|
| `q` | string ≤100 | search in title/subtitle/tags/instructor/category (AR+EN, diacritic-insensitive) |
| `category` | csv of category slugs | |
| `level` | csv: `beginner,intermediate,advanced` | |
| `instructor` | csv of instructor slugs | |
| `duration` | csv: `short` (<8h) `medium` (8–14h) `long` (>14h) | |
| `price` | `all`\|`free`\|`paid` | |
| `maxPrice` | number | |
| `minRating` | 0–5 | |
| `sort` | `popular`\|`newest`\|`rating`\|`priceAsc`\|`priceDesc`\|`duration` | default `popular` |
| `featured` `trending` `new` | boolean | |
| `page` | int ≥1 | default 1 |
| `pageSize` | int 1–50 | default 9 |

Response:
```json
{
  "data": [ { "id": "c-js", "slug": "modern-javascript-masterclass", "title": {"ar":"…","en":"…"}, "thumbnailUrl": "https://…", "coverImageUrl": "https://…",
              "videoUrl": "https://www.youtube.com/watch?v=PkZNo7MFNFg", "provider": "youtube", "durationHours": 14, "level": "beginner",
              "categoryId": "cat-programming", "instructorId": "ins-1", "price": 49, "rating": 4.9, "lessonsCount": 8, "…": "…" } ],
  "meta": { "page": 1, "pageSize": 9, "total": 23, "totalPages": 3 }
}
```
List items may omit `modules` (send `lessonsCount` instead). `GET /courses/{id}` must include `modules`.

### `POST /contact`
Request `{ "name": "…", "email": "…", "subject": "…", "message": "…" }` (name 2–100, subject 2–150, message 10–2000).
Response `202 { "data": { "accepted": true, "delivered": true, "demo": false, "message": "…" } }`.
*(Demo API always answers `delivered:false, demo:true` and neither sends nor stores anything.)*

### `POST /newsletter`
Request `{ "email": "…" }` → `202` same shape as above. Use double opt-in server-side.

### `/auth/*` (see §8)
`POST /auth/login {email,password}` → `200 { "data": { "user": UserDTO } }` + `Set-Cookie` (httpOnly session).
`GET /auth/session` → `{ "data": { "user": UserDTO | null } }`. Demo mode never authenticates.

## 5. Schemas (TypeScript — source of truth: `lib/api/types.ts`)
```ts
interface CourseDTO {
  id: string; slug: string;                         // required, slug unique & URL-safe
  title: L; subtitle: L; description: L;            // L = { ar: string; en: string }  (required)
  thumbnailUrl: string;                             // required, https, 16:10, ≥ 800px wide
  coverImageUrl: string;                            // required, https, wide hero, ≥ 1600px wide
  instructorImageUrl?: string;                      // optional (usually = instructor.avatarUrl)
  videoUrl: string; provider: "youtube"|"vimeo"|"mp4";   // required — preview video
  durationHours: number; level: "beginner"|"intermediate"|"advanced";
  categoryId: string; instructorId: string;
  price: number; oldPrice?: number;
  rating: number; reviewsCount: number; studentsCount: number;
  publishedAt: string; tags: string[]; outcomes: L[]; requirements: L[];
  featured?: boolean; trending?: boolean; isNew?: boolean; accent?: string;
  lessonsCount?: number; modules?: ModuleDTO[];
}
interface ModuleDTO { id: string; title: L; lessons: LessonDTO[] }
interface LessonDTO {
  id: string; title: L; description: L; durationMinutes: number;
  videoUrl: string; provider: "youtube"|"vimeo"|"mp4";   // required
  thumbnailUrl?: string; preview?: boolean; resources?: { id: string; title: L; kind: "pdf"|"link"|"code"|"slides"; url: string }[];
}
interface InstructorDTO {
  id: string; slug: string; name: L; title: L; bio: L; avatarUrl: string;
  expertise: string[]; rating: number; studentsCount: number;
  social?: { website?: string; x?: string; linkedin?: string; youtube?: string };
}
interface CategoryDTO { id; slug; name: L; description: L; icon: string; color: string; imageUrl: string; featured?: boolean; coursesCount?: number }
interface ReviewDTO { id; courseId; authorName: L; authorAvatarUrl?; rating: 1..5; createdAt; text: L; authorRole?: L }   // no e-mails / personal data
```

## 6. Errors
Every non-2xx response:
```json
{ "error": { "code": "validation_failed", "message": "Invalid request", "details": { "email": ["Invalid email"] } } }
```
Codes: `bad_request` 400 · `unauthorized` 401 · `forbidden` 403 · `not_found` 404 · `validation_failed` 422 · `rate_limited` 429 · `server_error` 5xx.
The client maps these to `ApiError` (`lib/api/errors.ts`); 5xx/429/network/timeout errors get a **Retry** button.

## 7. Media requirements
* **Images** (`thumbnailUrl`, `coverImageUrl`, `avatarUrl`, `imageUrl`): absolute `https` URLs on hosts allow-listed in `next.config.ts`. JPEG/WebP/AVIF. Thumbnail ≥ 800px (16:10), cover ≥ 1600px, avatar ≥ 400px square. **Upload endpoint is not part of this contract yet** — propose `POST /uploads/images` (multipart, ≤5 MB, image/* only, returns `{ url }`) when admin editing is built.
* **Videos** (`videoUrl`): *normal* page/watch URLs, not embed URLs — the front-end converts them (`lib/video.ts`).
  Supported: YouTube (`watch`, `youtu.be`, `shorts`, `embed`), Vimeo (`vimeo.com/{id}`), direct `.mp4/.webm` over https.
  Private/DRM-protected videos are **not** supported by this player; they need a signed-URL/streaming solution designed with the backend.
  The image never carries the video link: the thumbnail merely *opens* the player using the course/lesson `videoUrl`.

## 8. Authentication
Recommended: server-side session in an **httpOnly, Secure, SameSite=Lax/None cookie**; the front-end sends `credentials: "include"` on `/auth/*` only.
The front-end never stores passwords or tokens in `localStorage`/`sessionStorage`/JS memory. Authorization (roles, admin) **must** be enforced by the backend for every request; hiding links in the UI is not security.
Currently student progress, wishlist and notes live in `localStorage` (per browser). When the backend is ready add e.g. `GET/PUT /me/progress`, `/me/wishlist` (not in this contract yet).

## 9. CORS (only if the API is on another origin)
`Access-Control-Allow-Origin: <exact front-end origin>` (no `*` when using cookies), `Access-Control-Allow-Credentials: true`,
`Access-Control-Allow-Methods: GET,POST,OPTIONS`, `Access-Control-Allow-Headers: Content-Type`. Alternatively put both behind one domain / a reverse proxy to avoid CORS.

## 10. Not covered yet (phase 2)
Content endpoints for learning paths, blog, plans/pricing, FAQ, testimonials, notifications (served from demo data in both modes, see `lib/api/content.ts`), payments/subscriptions, certificates, admin CRUD, uploads, comments/Q&A.
