import { useTimerStore } from '~~/stores/timer';

/**
 * Wires up streaks on the client:
 *  - load (or reset, on logout) the streak whenever auth state settles/changes,
 *  - record a session every time a genuine work session finishes.
 *
 * Streaks are logged-in-only; the composable no-ops for anonymous visitors, so
 * this plugin is safe to run regardless of auth state.
 */
export default defineNuxtPlugin(() => {
    const { load, recordSession } = useStreak();
    const timerStore = useTimerStore();
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

        // `completedWorkSessions` only ever increases (skips don't bump it).
        // Guard against the decrease a future reset could cause so we never
        // record a phantom session.
        watch(
            () => timerStore.completedWorkSessions,
            (count, prev) => {
                if (count > (prev ?? 0)) {
                    void recordSession('work', timerStore.settings.workDuration);
                }
            },
        );
    });
});
