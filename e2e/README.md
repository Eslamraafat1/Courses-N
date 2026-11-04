# E2E Tests — NEXORA Academy

[Playwright](https://playwright.dev) end-to-end tests, run on **desktop Chrome** and **mobile Chrome (Pixel 7)**.
34 tests; the 7 SEO checks run on desktop only, so a full run is 61 executions.

| Spec | Tests | What it covers |
|---|---|---|
| `smoke.spec.js` | 10 | Key pages return 200 with the right title; EN is LTR, AR is RTL; unknown routes 404 |
| `catalog.spec.js` | 5 | Search → results + `?q=` in URL; empty state + clear; deep link; sort; level filter |
| `course.spec.js` | 3 | Catalogue → course page; sections; "Start learning" opens the lesson player |
| `forms.spec.js` | 3 | Sign-up validation (React Hook Form + Zod) and the valid-submit notice |
| `i18n.spec.js` | 3 | Language switch → `lang="ar" dir="rtl"`; cookie remembered; Arabic SSR is RTL |
| `seo.spec.js` | 7 | Canonical/hreflang, OG image, JSON-LD, robots.txt, sitemap.xml, noindex |
| `errors.spec.js` | 3 | Branded, localised 404 with correct status |

## Run

```bash
cd e2e
npm ci
npx playwright install chromium
npm test                                   # against the live site (default)
BASE_URL=http://localhost:3000 npm test    # against a local `npm run build && npm start`
```

In CI (`.github/workflows/e2e.yml`) the app is linted, type-checked and built, then the suite runs against the local production build.
