/**
 * Screen Wake Lock wrapper.
 *
 * Holds a `screen` wake lock to stop the display dimming/locking (which in turn
 * keeps the OS from sleeping) while the user wants the timer to stay alive.
 *
 * Browser realities this guards against:
 *  - the API doesn't exist everywhere (older Firefox) — degrade to a no-op,
 *  - the browser auto-releases the lock whenever the tab is hidden, so we must
 *    re-acquire it on `visibilitychange` when the page comes back to the front,
 *  - the lock is only meaningful with the tab open; there's no "system" lock on
 *    the web, so a forced OS sleep / lid close still wins.
 *
 * Module-scoped state keeps a single lock shared across every caller, so two
 * components asking to keep the screen awake can't fight over separate handles.
 */

let sentinel: WakeLockSentinel | null = null;
// True while the app *wants* the lock — drives re-acquisition after the browser
// silently drops it on tab hide.
let desired = false;
let listenerAttached = false;

function supported(): boolean {
    return (
        !import.meta.server &&
        typeof navigator !== 'undefined' &&
        'wakeLock' in navigator
    );
}

async function acquire() {
    if (!supported() || sentinel) return;
    try {
        sentinel = await navigator.wakeLock.request('screen');
        // The browser may release the lock on its own (tab hidden, power
        // saver). Clear our handle so a later acquire() can re-request.
        sentinel.addEventListener('release', () => {
            sentinel = null;
        });
    } catch {
        // NotAllowedError (tab not visible, denied by policy) is non-fatal —
        // we'll retry on the next visibility change.
        sentinel = null;
    }
}

async function release() {
    if (!sentinel) return;
    try {
        await sentinel.release();
    } catch {
        // Ignore — already gone.
    } finally {
        sentinel = null;
    }
}

function onVisibilityChange() {
    // Re-acquire when the tab returns to the foreground, since the browser
    // drops the lock while hidden.
    if (desired && document.visibilityState === 'visible') {
        void acquire();
    }
}

export function useWakeLock() {
    /** Acquire now and keep re-acquiring across tab visibility changes. */
    function enable() {
        if (!supported()) return;
        desired = true;
        if (!listenerAttached) {
            document.addEventListener('visibilitychange', onVisibilityChange);
            listenerAttached = true;
        }
        void acquire();
    }

    /** Stop wanting the lock and let the screen sleep again. */
    function disable() {
        desired = false;
        if (listenerAttached) {
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            listenerAttached = false;
        }
        void release();
    }

    return { enable, disable, isSupported: supported };
}
