import { defineStore } from 'pinia';

/**
 * Mirror of the user's billing state from `profiles` (`subscription_status`,
 * `subscription_end_at`). Server is the source of truth — Stripe webhooks write
 * those columns; the client only reads them. Anonymous visitors stay in the
 * reset/empty state.
 *
 * This store deliberately knows nothing about the `PRO_GATING_ENABLED` switch
 * or per-feature rules — it answers only "does this user have a live paid
 * subscription right now". The `useIsPro` composable layers the gating policy on
 * top. See `subscription.client.ts` for the load-on-auth wiring.
 */
export const useSubscriptionStore = defineStore('subscription', {
    state: () => ({
        /** Raw Stripe-ish status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | … */
        status: 'free' as string,
        /** ISO timestamp the current period ends, if any. */
        endsAt: null as string | null,
        /** True once a load() has resolved, so the UI can avoid a wrong-state flash. */
        loaded: false,
    }),

    getters: {
        /**
         * Raw entitlement: does the user have a live paid subscription? Ignores
         * the global gating switch — that policy lives in `useIsPro`. A set end
         * date in the past is treated as lapsed even if the status hasn't synced.
         */
        hasActiveSubscription: (state): boolean => {
            if (state.status !== 'active' && state.status !== 'trialing') {
                return false;
            }
            if (!state.endsAt) return true;
            return new Date(state.endsAt).getTime() > Date.now();
        },
    },

    actions: {
        set(data: { status: string; endsAt: string | null }) {
            this.status = data.status;
            this.endsAt = data.endsAt;
            this.loaded = true;
        },

        /**
         * Mark a load attempt as settled without changing the status. Used when a
         * fetch fails: we keep the last-known (or default 'free') state rather
         * than clobbering a good status on a transient blip, but still flip
         * `loaded` so the UI never waits forever. Failing to 'free' is the safe
         * default for an entitlement check.
         */
        markLoaded() {
            this.loaded = true;
        },

        /** Clear on logout so one account's plan can't show under another. */
        reset() {
            this.status = 'free';
            this.endsAt = null;
            this.loaded = false;
        },
    },
});
