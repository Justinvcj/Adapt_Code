import { defineConfig, devices } from '@playwright/test';

/**
 * AdaptCode E2E — Playwright config.
 *
 * - Default target: a locally running `npm run dev` (http://localhost:3000),
 *   which Playwright starts for us when PLAYWRIGHT_BASE_URL is unset.
 * - Deployed target: `PLAYWRIGHT_BASE_URL=https://adaptcode.vercel.app npx playwright test`.
 *
 * The specs under `e2e/` are offline-tolerant: when NEXT_PUBLIC_API_URL is
 * unset at build time the UI falls back to mocks, and the smokes assert
 * both branches work (the logged-in "real" flow is covered when a backend
 * is actually wired up).
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT || 3000);
const USE_EXTERNAL = Boolean(process.env.PLAYWRIGHT_BASE_URL);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Only boot a dev server when we're NOT testing an already-deployed URL.
  webServer: USE_EXTERNAL
    ? undefined
    : {
        command: 'npm run dev',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
