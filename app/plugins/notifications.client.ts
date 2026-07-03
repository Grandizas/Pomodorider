import { useTimerStore, type TimerMode } from '~~/stores/timer';

/**
 * Fires a browser notification when a session finishes while the user is away
 * from the tab. On-screen the timer UI and end sound already announce it, so we
 * only nudge when the page isn't visible — that's the whole point of the
 * feature ("remind me when I'm outside the site").
 *
 * The store owns the "a session ended" signal (`sessionEndCount`); this plugin
 * owns the browser-specific concerns (visibility, permission, copy). Opt-in via
 * the `notificationsEnabled` setting, and permission is checked live at fire
 * time so a later revoke silently stops notifications.
 */
const COPY: Record<TimerMode, { title: string; body: string }> = {
    work: {
        title: 'Focus session complete 🎉',
        body: 'Nice work — time for a break.',
    },
    shortBreak: {
        title: 'Break over ☕',
        body: 'Ready to focus again?',
    },
    longBreak: {
        title: 'Break over ☕',
        body: 'Ready to focus again?',
    },
};

export default defineNuxtPlugin(() => {
    const timerStore = useTimerStore();
    const { notify } = useNotifications();

    onNuxtReady(() => {
        watch(
            () => timerStore.sessionEndCount,
            (count, prev) => {
                if (!count || count === prev) return;
                if (!timerStore.settings.notificationsEnabled) return;

                // Only when the user is away — a visible tab already shows the
                // result on screen and plays the end sound.
                if (document.visibilityState === 'visible') return;

                const { title, body } = COPY[timerStore.lastEndedMode];
                const n = notify(title, {
                    body,
                    icon: '/favicon.ico',
                    // Collapse repeats into one entry rather than stacking.
                    tag: 'pomodorider-timer',
                });
                if (n) {
                    n.onclick = () => {
                        window.focus();
                        n.close();
                    };
                }
            },
        );
    });
});
