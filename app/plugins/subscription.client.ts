/**
 * Wires up subscription state on the client: load (or reset, on logout) the
 * user's billing status whenever auth state settles or changes, so `useIsPro`
 * has fresh data to gate on.
 *
 * Gating is logged-in-only and currently off (see `PRO_GATING_ENABLED`); the
 * composable no-ops for anonymous visitors, so this plugin is safe to run
 * regardless of auth state.
 */
export default defineNuxtPlugin(() => {
    const { load } = useIsPro();
    const user = useSupabaseUser();

    onNuxtReady(() => {
        // Runs once now and again on every login/logout. Watching `user`
        // directly (its id lives in `sub`) is what makes those transitions fire.
        watch(
            user,
            () => {
                void load();
            },
            { immediate: true },
        );
    });
});
