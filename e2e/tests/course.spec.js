import { test, expect } from '@playwright/test';

const SLUG = 'modern-javascript-masterclass';

test.describe('Course detail', () => {
  test('opening a course from the catalogue shows its detail page', async ({ page }) => {
    await page.goto('/en/courses?q=Modern%20JavaScript');
    const link = page.getByRole('link', { name: 'Modern JavaScript Masterclass' }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/en/courses/${SLUG}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Modern JavaScript Masterclass/);
  });

  test('detail page has curriculum, instructor and reviews sections', async ({ page }) => {
    await page.goto(`/en/courses/${SLUG}`);
    for (const id of ['overview', 'curriculum', 'instructor', 'reviews']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
    const tabs = page.getByRole('navigation', { name: /sections/i });
    await expect(tabs.getByRole('link')).toHaveCount(4);
  });

  test('"Start learning" opens the lesson player on the first lesson', async ({ page }) => {
    await page.goto(`/en/courses/${SLUG}`);
    await page.getByRole('link', { name: 'Start learning' }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/learn/${SLUG}/[^/]+$`), { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
