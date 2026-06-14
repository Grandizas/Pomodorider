import { useTimerStore } from '~~/stores/timer';

/**
 * Holds a screen wake lock while the timer is actively running *and* the user
 * has opted in via the "keep screen awake" setting. Releasing on pause/complete
 * lets the machine sleep normally between sessions.
 */
export default defineNuxtPlugin(() => {
    const { enable, disable } = useWakeLock();
    const timerStore = useTimerStore();

    onNuxtReady(() => {
        watch(
            // Lock only when both the opt-in is on and the clock is ticking.
            () => timerStore.settings.keepAwake && timerStore.isRunning,
            (shouldHold) => {
                if (shouldHold) enable();
                else disable();
            },
            { immediate: true },
        );
    });
});
