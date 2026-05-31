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
        // Run E2E against a production build, NOT `nuxt dev`. Vite's dev server
        // lazily pre-bundles dependencies and pushes a full-page reload when it
        // does, which aborts in-flight client modules mid-test and breaks
        // hydration — non-deterministically, and worse on CI's cold cache. The
        // production build has no optimizeDeps step, so there are no surprise
        // reloads: tests are deterministic locally and in CI.
        command: 'npm run build && npm run preview',
        url: 'http://localhost:3001',
        // `nuxt preview` runs the Nitro server, which honours PORT/NITRO_PORT
        // (it would default to 3000 otherwise). baseURL above expects 3001.
        env: { PORT: '3001', NITRO_PORT: '3001' },
        // Do NOT reuse an existing server — a server you started by hand may be
        // loaded with prod env, which would point tests at your real DB.
        reuseExistingServer: false,
        // Generous: a cold `nuxt build` + server start can take a while on CI.
        timeout: 180_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
