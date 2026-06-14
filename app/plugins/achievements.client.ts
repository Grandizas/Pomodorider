import { useStreakStore } from '~~/stores/streak';

/**
 * Wires up achievements on the client:
 *  - load (or reset, on logout) the unlocked set whenever auth state changes,
 *  - reload whenever the user's longest streak grows.
 *
 * Streak achievements are unlocked by the same DB transaction that updates the
 * streaks row, so once `longestStreak` increases the new achievement row is
 * already committed — reloading then is race-free (no polling/timeout needed).
 * The reload diffs against the previous set and toasts anything new.
 *
 * Achievements are logged-in-only; the composable no-ops for anonymous
 * visitors, so this plugin is safe to run regardless of auth state.
 */
export default defineNuxtPlugin(() => {
    const { load } = useAchievements();
    const streakStore = useStreakStore();
    const user = useSupabaseUser();

    onNuxtReady(() => {
        watch(
            user,
            () => {
                void load();
            },
            { immediate: true },
        );

        watch(
            () => streakStore.longestStreak,
            (val, prev) => {
                if (val > (prev ?? 0)) void load();
            },
        );
    });
});
