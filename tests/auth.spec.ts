import { test, expect } from '@playwright/test';

/**
 * Each test invents a fresh email so reruns don't collide with users left
 * behind by previous runs. The test Supabase project's `auth.users` table
 * will accumulate over time — fine on free-tier limits, but worth cleaning
 * out occasionally (or wiring up an admin-API teardown later).
 */
const uniqueEmail = () =>
    `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

/**
 * Navigate, then wait for the network to go idle.
 *
 * `page.goto` resolves on the `load` event, which in `nuxt dev` fires BEFORE
 * Vue finishes hydrating. Clicking a button in that window hits SSR markup
 * whose event handlers aren't attached yet, so the click is a no-op and the
 * form never submits. Waiting for `networkidle` lets hydration complete before
 * we interact. (The one-time Vite dep-optimization reload is handled separately
 * by tests/global-setup.ts.)
 */
const gotoReady = async (page: import('@playwright/test').Page, path: string) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
};

test.describe('Email auth', () => {
    test('user can sign up, log out, and log back in', async ({ page }) => {
        const email = uniqueEmail();
        const password = 'TestPassword123!';

        // ─── Sign up ────────────────────────────────────────────────────
        await gotoReady(page, '/signup');

        // getByLabel matches the <label for> → <input id> association in
        // Input.vue. `exact: true` is needed for the Password field because
        // "Confirm password" also contains the substring "Password".
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByLabel('Confirm password').fill(password);
        await page.getByRole('button', { name: /sign up/i }).click();

        // The signup page shows a "check your email" success state even when
        // email confirmation is disabled at the project level — the page
        // doesn't know about the dashboard setting. The session is still live.
        await expect(page.getByText(/check your email/i)).toBeVisible();

        // ─── Confirm we're actually signed in ───────────────────────────
        // Header.vue renders the user's email when authenticated (on /app; the
        // landing page at / has its own nav without the account chip).
        await gotoReady(page, '/app');
        await expect(page.getByText(email)).toBeVisible();

        // ─── Log out ────────────────────────────────────────────────────
        await page.getByRole('button', { name: /log out/i }).click();

        // After logout, Header shows a Login link (rendered as an <a> by
        // ui-button when given `to=`), and the email is gone.
        await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
        await expect(page.getByText(email)).not.toBeVisible();

        // ─── Log back in with the same credentials ──────────────────────
        await gotoReady(page, '/login');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: /sign in/i }).click();

        // login.vue does router.push('/app') on success.
        await expect(page).toHaveURL('/app');
        await expect(page.getByText(email)).toBeVisible();
    });

    test('login with wrong password shows a form-level error', async ({
        page,
    }) => {
        // Seed a real account first so the error we hit is "wrong password",
        // not "user doesn't exist" (which Supabase phrases identically anyway,
        // but this keeps the test honest).
        const email = uniqueEmail();
        const password = 'TestPassword123!';

        await gotoReady(page, '/signup');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByLabel('Confirm password').fill(password);
        await page.getByRole('button', { name: /sign up/i }).click();
        await expect(page.getByText(/check your email/i)).toBeVisible();

        // Log out the session that signup created (from /app, which has the header).
        await gotoReady(page, '/app');
        await page.getByRole('button', { name: /log out/i }).click();
        await expect(page.getByRole('link', { name: /login/i })).toBeVisible();

        // Now attempt to log in with a wrong password.
        await gotoReady(page, '/login');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill('definitely-not-the-password');
        await page.getByRole('button', { name: /sign in/i }).click();

        // formError (our top-level error, not a per-field one) should appear.
        // Supabase returns "Invalid login credentials" for both wrong email
        // and wrong password, intentionally — don't assert exact wording.
        await expect(page.locator('.auth-error')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });
});
