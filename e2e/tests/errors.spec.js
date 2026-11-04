import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test('unknown URL returns 404 with the branded, localised page', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist');
    expect(res.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: 'This page wandered off' })).toBeVisible();
    await page.getByRole('link', { name: /go home|home/i }).first().click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test('Arabic 404 is RTL', async ({ page }) => {
    const res = await page.goto('/ar/no-such-page');
    expect(res.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('unknown course slug shows the not-found page', async ({ page }) => {
    await page.goto('/en/courses/not-a-real-course');
    await expect(page.getByRole('heading', { name: 'This page wandered off' })).toBeVisible();
  });
});
