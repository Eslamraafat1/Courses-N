import { test, expect } from '@playwright/test';

// Sign-up form: client-side validation with react-hook-form + zod (no backend: a valid submit only shows a notice).

test.describe('Sign-up form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/register');
  });

  test('empty submit shows required-field errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
    await expect(page.getByText('This field is required').first()).toBeVisible();
    await expect(page.getByText('You need to accept the terms to continue')).toBeVisible();
    await expect(page.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true');
  });

  test('invalid email, short password and mismatched confirmation are rejected', async ({ page }) => {
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByLabel('Confirm password').fill('different');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('a valid form passes validation and shows the demo notice', async ({ page }) => {
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Email address').fill('test.user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('correct-horse-42');
    await page.getByLabel('Confirm password').fill('correct-horse-42');
    await page.getByLabel(/I agree to the Terms/).check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Looks valid — but no account was created')).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  });
});
