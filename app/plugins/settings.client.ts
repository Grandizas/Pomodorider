import { useTimerStore } from '~~/stores/timer';
import { useThemeStore } from '~~/stores/theme';

/**
 * Wires up settings persistence on the client:
 *  - hydrate from localStorage / the DB on startup,
 *  - persist (debounced) whenever the user changes a setting or theme,
 *  - re-load on login (migrating the anon cache) and keep caching on logout.
 */
export default defineNuxtPlugin(() => {
    const { load, persist } = useUserSettings();
    const timerStore = useTimerStore();
    const themeStore = useThemeStore();
    const user = useSupabaseUser();

    // Register persist watchers first so they're live before the initial load.
    // The `applying` guard inside the composable stops load()'s own mutations
    // from echoing straight back out as a save.
    // Watch only the settings slice — not the whole timer store, whose
    // `timeRemaining` mutates every second while running.
    watch(() => timerStore.settings, persist, { deep: true });
    watch(() => themeStore.activeTheme, persist);

    // Defer the first load until after hydration. load() mutates the stores
    // (applying saved durations/theme); doing that during hydration makes the
    // client markup diverge from the server-rendered defaults and triggers Vue
    // hydration-mismatch warnings. onNuxtReady fires once the app is mounted.
    onNuxtReady(() => {
        // Drive load() off the auth state with `immediate`: it runs once now
        // (anon → localStorage only) and again the moment the Supabase session
        // restores or the user logs in/out — which is when the account's row
        // gets pulled or the local cache gets migrated up. Watching `user`
        // directly (not `user.value.id`, which is undefined — the id is in
        // `sub`) is what makes login/logout transitions fire.
        watch(
            user,
            () => {
                void load();
            },
            { immediate: true },
        );
    });
});
