import { test, expect } from '@playwright/test';

// On phones the switcher lives in the menu drawer; on desktop it is in the header.
async function switchToArabic(page, isMobile) {
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: /Switch language: العربية/ }).locator('visible=true').first().click();
}

test.describe('Language switch (EN ⇄ AR, LTR ⇄ RTL)', () => {
  test('switching to Arabic keeps the page and flips lang/dir', async ({ page, isMobile }) => {
    await page.goto('/en/courses');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await switchToArabic(page, isMobile);
    await expect(page).toHaveURL(/\/ar\/courses$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(/Explore courses/);
  });

  test('the chosen language is remembered for locale-less URLs', async ({ page, context, isMobile }) => {
    await page.goto('/en');
    await switchToArabic(page, isMobile);
    await expect(page).toHaveURL(/\/ar$/);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'nx-lang')?.value).toBe('ar');

    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/ar\/pricing$/);
  });

  test('Arabic is server-rendered with lang="ar" dir="rtl" (no client flip)', async ({ request }) => {
    const html = await (await request.get('/ar/courses')).text();
    expect(html).toMatch(/<html[^>]*lang="ar"[^>]*dir="rtl"/);
  });
});
