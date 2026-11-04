import { test, expect } from '@playwright/test';

// Technical SEO checks on server-rendered HTML (what crawlers see).

const head = async (request, path) => {
  const res = await request.get(path);
  expect(res.status()).toBe(200);
  return res.text();
};
const attr = (html, re) => html.match(re)?.[1];
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const types = (blocks) => blocks.flatMap((b) => (b['@graph'] ? b['@graph'] : [b])).map((b) => b['@type']);

test.describe('SEO', () => {
  // Request-only checks: run once (desktop project).
  test.skip(({ isMobile }) => isMobile, 'HTML checks are viewport independent');

  test('canonical and hreflang are absolute https URLs, never localhost', async ({ request }) => {
    const html = await head(request, '/en/courses');
    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
    expect(canonical).toMatch(/^https:\/\/[^/]+\/en\/courses$/);
    expect(html).not.toContain('localhost');
    for (const lang of ['en', 'ar', 'x-default']) {
      expect(attr(html, new RegExp(`<link rel="alternate" hrefLang="${lang}" href="([^"]+)"`))).toMatch(/^https:\/\//);
    }
  });

  test('home has title, description, Open Graph image and Organization/WebSite JSON-LD', async ({ request }) => {
    const html = await head(request, '/en');
    expect(attr(html, /<title>([^<]+)<\/title>/)).toMatch(/NEXORA ACADEMY/);
    expect(attr(html, /<meta name="description" content="([^"]+)"/)?.length).toBeGreaterThan(50);
    const og = attr(html, /<meta property="og:image" content="([^"]+)"/);
    expect(og).toMatch(/^https:\/\//);
    expect(types(jsonLd(html))).toEqual(expect.arrayContaining(['EducationalOrganization', 'WebSite']));
  });

  test('default OG image is a 1200x630 PNG', async ({ request }) => {
    const res = await request.get('/en/opengraph-image');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
    const png = await res.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]); // IHDR width/height
  });

  test('course page has Course + BreadcrumbList JSON-LD that parses', async ({ request }) => {
    const blocks = jsonLd(await head(request, '/en/courses/modern-javascript-masterclass'));
    const course = blocks.find((b) => b['@type'] === 'Course');
    expect(course.name).toBe('Modern JavaScript Masterclass');
    expect(course.url).toMatch(/^https:\/\/.+\/en\/courses\/modern-javascript-masterclass$/);
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.length).toBeGreaterThanOrEqual(3);
    for (const it of crumbs.itemListElement) expect(it.item).toMatch(/^https:\/\//);
  });

  test('robots.txt allows crawling, blocks admin/api and references the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toMatch(/Sitemap: https:\/\/[^\s]+\/sitemap\.xml/);
    expect(txt).not.toContain('localhost');
  });

  test('sitemap.xml lists both locales with hreflang alternates', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(50);
    expect(locs.every((u) => u.startsWith('https://'))).toBe(true);
    expect(locs.some((u) => u.endsWith('/en/courses/modern-javascript-masterclass'))).toBe(true);
    expect(locs.some((u) => u.endsWith('/ar/courses/modern-javascript-masterclass'))).toBe(true);
    expect(xml).toContain('hreflang="ar"');
    expect(locs.some((u) => u.includes('/admin'))).toBe(false);
  });

  test('private pages are noindex', async ({ request }) => {
    const html = await head(request, '/en/dashboard');
    expect(html).toMatch(/<meta name="robots" content="[^"]*noindex/);
  });
});
