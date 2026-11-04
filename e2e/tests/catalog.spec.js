import { test, expect } from '@playwright/test';

// Course catalogue: search, filters and sort are reflected in the results and in the URL (shareable state).

const count = (page) => page.getByRole('status').filter({ hasText: /course(s)? found/ });
const cards = (page) => page.locator('main ul li article');

async function totalFrom(page) {
  await expect(count(page)).toBeVisible();
  const text = await count(page).innerText();
  return Number(text.match(/\d+/)[0]);
}

test.describe('Course catalogue', () => {
  test('search narrows results and is written to the URL', async ({ page }) => {
    await page.goto('/en/courses');
    const before = await totalFrom(page);
    expect(before).toBeGreaterThan(1);

    await page.getByLabel('Search within courses').fill('javascript');
    await expect(page).toHaveURL(/[?&]q=javascript/);
    await expect.poll(() => totalFrom(page)).toBeLessThan(before);
    await expect(page.getByRole('button', { name: /Search: javascript/i })).toBeVisible();

    // results are still rendered as course cards
    await expect(cards(page).first().getByRole('heading')).toBeVisible();
  });

  test('a search with no matches shows the empty state and can be cleared', async ({ page }) => {
    await page.goto('/en/courses?q=zzqx-no-such-course');
    await expect(page.getByText('No courses match these filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    await expect(page).not.toHaveURL(/q=/);
    expect(await totalFrom(page)).toBeGreaterThan(1);
  });

  test('URL state is restored on load (deep link)', async ({ page }) => {
    await page.goto('/en/courses?level=beginner&sort=rating');
    await expect(page.getByLabel('Sort by')).toHaveValue('rating');
    await expect(page.getByRole('button', { name: /Remove.*Beginner|Beginner/ }).first()).toBeVisible();
  });

  test('sort select updates the URL', async ({ page }) => {
    await page.goto('/en/courses');
    await totalFrom(page);
    await page.getByLabel('Sort by').selectOption('priceAsc');
    await expect(page).toHaveURL(/[?&]sort=priceAsc/);
  });

  test('level filter reduces results (desktop sidebar / mobile sheet)', async ({ page, isMobile }) => {
    await page.goto('/en/courses');
    const before = await totalFrom(page);

    if (isMobile) {
      await page.getByRole('button', { name: /^Filters/ }).click();
      const sheet = page.getByRole('dialog');
      await sheet.getByLabel(/^Advanced/).check();
      await sheet.getByRole('button', { name: 'Show results' }).click();
    } else {
      // controlled by URL state, so click (not check) and wait for the URL to update
      await page.getByRole('complementary', { name: 'Filters' }).getByLabel(/^Advanced/).click();
    }

    await expect(page).toHaveURL(/[?&]level=advanced/);
    await expect.poll(() => totalFrom(page)).toBeLessThan(before);
  });
});
