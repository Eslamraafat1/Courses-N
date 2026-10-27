# NEXORA ACADEMY — Implementation status

Next.js 16.4 (App Router, Cache Components + Partial Prefetching), React 19.3, Tailwind v4, TypeScript strict.
Everything below was built; `tsc`, `eslint` and `next build` (714 static pages) pass.

## Run
```bash
npm install
npm run dev            # Demo mode (default) — no backend needed
npm run build && npm start
```
Demo ⇄ Backend is controlled only by env vars (see `.env.example`, `docs/BACKEND_INTEGRATION.md`):
```
NEXT_PUBLIC_USE_DEMO_API=true                      # false → backend mode
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api # used only in backend mode
```

## Architecture (data layer)
```
UI (pages / sections / components)
   └─ "@/lib/api"            server data access: getCourse(), listCourses(), getCategories() …   (lib/api/index.ts)
        ├─ source.ts          demo ⇄ backend switch (+ dev-only fallback to demo if backend is down)
        ├─ demo/service.ts    in-memory "backend" over data/demo/* (reuses lib/catalog.ts filters)
        ├─ remote.ts          cached (use cache) GET to NEXT_PUBLIC_API_BASE_URL
        ├─ mappers.ts         wire DTO ⇄ UI domain types (only place that knows both)
        └─ types.ts / endpoints.ts / errors.ts / config.ts / client.ts / browser.ts / auth.ts
app/api/*                    Demo API Route Handlers (courses, courses/[id], lessons, reviews, categories,
                             instructors, instructors/[id], search, contact, newsletter) with Zod validation
```

## Delivered
Added later: rebuilt WhyChooseUs ("feature theatre"), motion pass on all home sections (Fx.tsx primitives), richer About/Contact, new pages /become-instructor, /success-stories, /accessibility.

Foundation (tokens, AR/EN + RTL/LTR, theme without flash, providers, toasts, modal system, command palette,
Lenis+GSAP scroll, scroll progress, scroll-to-top, section indicator, lazy video modal), 19 home sections
(Hero + R3F scenes, marquee, bento, editorial, stacked deck, timeline, horizontal pinned scroll, 3D universe…),
catalog (live filters, URL sync, quick-view shared-layout transition), course details/curriculum/reviews/certificate,
lesson player, paths, instructors, blog, legal, help, FAQ, pricing, contact, auth UI, student dashboard (11 pages),
admin UI (10 pages), sitemap/robots/JSON-LD.
22 demo courses across 10 categories, each with `thumbnail` + `coverImage` (Unsplash, visually verified) and instructor avatars.

## Needs a real backend (UI only today)
Authentication & roles (demo "login" never signs anyone in), payments/subscriptions, persisting contact/newsletter,
saving admin edits, reviews/Q&A persistence, certificates, cross-device progress/wishlist, notifications delivery,
uploads, content endpoints for paths/blog/plans/FAQ (served from demo data in both modes).
Wishlist / progress / notes / preferences use `localStorage` (per browser only).

## Known limitations
* Production builds do **not** fall back to demo data if the backend is unreachable (so a broken backend is never masked);
  set `API_FALLBACK_TO_DEMO=true` (server-only) to allow it. `next dev` falls back automatically with a warning.
* Image/video hosts must be allow-listed in `next.config.ts` (`images.unsplash.com`, `i.ytimg.com` today).
* Auto-advance after a lesson works for MP4 only (YouTube/Vimeo embeds do not report completion).
* In the pinned "stacked deck" section the cards can briefly overlap the intro line mid-transition on desktop.
