# NEXORA ACADEMY — Cinematic Bilingual Learning Platform

منصة تعليم إلكتروني سينمائية (عربي RTL / English LTR) مبنية بـ **Next.js 16** و**React 19** و**Tailwind 4** و**GSAP** و**Framer Motion** و**Three.js**.
واجهة كاملة تعمل الآن على بيانات تجريبية (Demo API)، وجاهزة للتوصيل بـ Backend حقيقي دون إعادة بناء الواجهة.

> This is a front-end demo. No real authentication, payments, e-mail or persistence exist until a backend is connected.

## Quick start
```bash
npm install
npm run dev          # http://localhost:3000  (Demo mode, no backend needed)
npm run build && npm start
```

## Highlights
* Cinematic course-carousel hero, 19+ animated home sections (GSAP ScrollTrigger, Framer Motion, React Three Fiber)
* Arabic / English with full RTL ⇄ LTR, light / dark themes without flash
* Catalog with live search, filters, sorting, URL state, quick-view transition
* Course pages, lesson player (YouTube / Vimeo / MP4 modal & inline), progress saved locally
* Student dashboard (11 pages) and Admin UI (10 pages, UI-only)
* Demo API (`app/api/*`) with Zod validation + typed data-access layer (`lib/api`) switchable to a real backend

## Demo ⇄ Backend
Controlled only by env vars (see `.env.example`):
```
NEXT_PUBLIC_USE_DEMO_API=true                       # false → backend mode
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api  # backend mode only
```
Full proposed contract: [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md). Status & limitations: [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md).

## Project structure
```
app/[lang]/(site)   public pages        app/[lang]/(admin)  admin UI (preview only)
app/api             Demo API handlers   lib/api             data-access layer (demo ⇄ backend)
components/*        sections, ui, courses, video, animations, three, admin, dashboard
data/               demo data           lib/i18n            ar/en dictionaries
```

## Scripts
`npm run dev` · `npm run build` · `npm start` · `npm run lint`

## Needs a real backend
Authentication & roles, payments, contact/newsletter delivery, saving admin edits, reviews/Q&A, certificates, cross-device sync, uploads.
