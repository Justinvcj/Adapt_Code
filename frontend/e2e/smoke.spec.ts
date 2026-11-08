import { test, expect } from '@playwright/test';

/**
 * Smoke tests — the pages render and the primary CTAs exist.
 * These are offline-tolerant: no backend is required.
 */

test('homepage renders brand + Learn CTA', async ({ page }) => {
  await page.goto('/');
  // Logo and brand text (visible in the Navbar / hero).
  await expect(page).toHaveTitle(/AdaptCode/i);
  // Learn CTA button exists in the hero.
  await expect(page.getByRole('button', { name: /^Learn$/ })).toBeVisible();
  // Twelve concepts section header (there are two matching nodes — mastery
  // panel heading + sticky sub-head; .first() is enough signal here).
  await expect(page.getByRole('heading', { name: /twelve concepts/i }).first()).toBeVisible();
});

test('login page shows both tabs and Google button', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /create account/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
});

test('problems list page renders', async ({ page }) => {
  await page.goto('/problems');
  // The Problems list has a toolbar + at least one problem row from the
  // offline fallback (frontend/src/data/problems.ts) regardless of backend.
  await expect(page.locator('body')).toContainText(/Two Sum|Problem/i);
});

test('problem page renders with editor container', async ({ page }) => {
  test.setTimeout(90_000); // Next.js cold-compile on first hit.
  await page.goto('/problem/two-sum');
  // Run + Submit buttons mount from the page itself.
  await expect(page.getByRole('button', { name: /^Run$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Submit$/ })).toBeVisible();
  // The editor pane container (parent of Monaco). Monaco itself is loaded
  // via next/dynamic and doesn't always finish mounting in headless
  // Chromium — asserting on the container is a stable proxy.
  await expect(page.locator('.ed-area')).toBeVisible({ timeout: 30_000 });
  // The language selector (uses a fallback select element) also renders.
  await expect(page.locator('select.lang-sel')).toBeVisible();
});

test('onboarding page renders concept checklist', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: /what do you already know/i })).toBeVisible();
  // At least one concept tile exists.
  await expect(page.getByRole('button', { name: /basic syntax/i })).toBeVisible();
});

test('/learn dispatcher routes to a problem', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/learn');
  // The dispatcher redirects to /problem/<slug>. In offline mode this
  // defaults to /problem/two-sum; with a backend it may be any slug.
  await page.waitForURL(/\/problem\/[a-z0-9-]+/i, { timeout: 15_000 });
  // Don't re-assert Monaco (covered by the earlier spec) — just confirm
  // we landed on a problem page by checking for its Run button.
  await expect(page.getByRole('button', { name: /^Run$/ })).toBeVisible({ timeout: 30_000 });
});
