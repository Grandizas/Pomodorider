import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Pomodorider auth flows.
 *
 * Tests are run via `npm test`, which is `dotenv -e .env.test -- playwright test`.
 * dotenv-cli loads .env.test into process.env before Playwright starts, and the
 * `webServer` below inherits those vars when it spawns `nuxt dev`. Net effect:
 * the dev server Playwright drives talks to the TEST Supabase project, not prod.
 */
export default defineConfig({
    testDir: './tests',
    // Warm the Vite dev server (one-time optimizeDeps) before tests interact
    // with it — otherwise the first navigation's reload aborts client modules
    // and pages never hydrate. See tests/global-setup.ts.
    globalSetup: './tests/global-setup.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'http://localhost:3001',
        // Record a trace on the first retry so failed CI runs are debuggable.
        // Open with: npx playwright show-trace test-results/<...>/trace.zip
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Add firefox / webkit later if you want cross-browser coverage.
        // Each extra browser ~triples wall-clock test time.
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3001',
        // Do NOT reuse an existing server — a `nuxt dev` you started by hand
        // is loaded with prod .env, which would point tests at your real DB.
        // Stop your dev server before running `npm test`.
        reuseExistingServer: false,
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
