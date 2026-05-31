import { chromium, type FullConfig } from '@playwright/test';

/**
 * Warm up the Vite dev server before any test runs.
 *
 * Playwright starts a fresh `nuxt dev` for each `npm test`. On the very first
 * navigation, Vite lazily pre-bundles dependencies (optimizeDeps) and then
 * forces a full reload, which ABORTS the in-flight client-side module requests
 * (net::ERR_ABORTED). The page's SSR HTML renders, but the client never
 * hydrates — so buttons are inert and form submits do nothing. That's what made
 * the auth tests fail: clicking "Sign up" never triggered a Supabase request.
 *
 * Visiting each route the suite uses, and waiting for the network to settle,
 * triggers that one-time dep optimization here instead of mid-test. By the time
 * the real tests run, the server is warm and pages hydrate normally.
 */
export default async function globalSetup(config: FullConfig) {
    const baseURL =
        config.projects[0]?.use?.baseURL ?? 'http://localhost:3001';

    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const path of ['/', '/login', '/signup']) {
        // Two passes: the first triggers optimizeDeps + reload, the second
        // confirms the warmed graph loads cleanly and hydrates.
        for (let i = 0; i < 2; i++) {
            await page.goto(`${baseURL}${path}`, {
                waitUntil: 'networkidle',
                timeout: 60_000,
            });
        }
    }

    await browser.close();
}
