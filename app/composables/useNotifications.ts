/**
 * Thin wrapper over the Web Notifications API. Guards SSR and unsupported
 * browsers, and exposes a reactive `permission` so the settings UI can react to
 * a grant/deny. The actual "session ended" firing lives in
 * `notifications.client.ts`; this composable only owns capability detection,
 * the permission prompt, and the low-level `notify` call.
 */
export function useNotifications() {
    const supported =
        import.meta.client &&
        typeof window !== 'undefined' &&
        'Notification' in window;

    /** Live browser permission: 'default' | 'granted' | 'denied'. */
    const permission = ref<NotificationPermission>(
        supported ? Notification.permission : 'denied',
    );

    /**
     * Prompt for permission (must be called from a user gesture). Resolves to
     * the resulting permission and keeps `permission` in sync.
     */
    async function requestPermission(): Promise<NotificationPermission> {
        if (!supported) return 'denied';
        try {
            const result = await Notification.requestPermission();
            permission.value = result;
            return result;
        } catch {
            // Legacy Safari used a callback-only signature that rejects the
            // promise form — fall back to reading the current value.
            permission.value = Notification.permission;
            return permission.value;
        }
    }

    /**
     * Show a notification, or no-op (returning null) when unsupported or not
     * granted. Never throws: some platforms (e.g. Android Chrome) require a
     * service worker and throw on the plain constructor, which we swallow so a
     * failed notification can never break the timer.
     */
    function notify(
        title: string,
        options?: NotificationOptions,
    ): Notification | null {
        if (!supported || Notification.permission !== 'granted') return null;
        try {
            return new Notification(title, options);
        } catch {
            return null;
        }
    }

    return { supported, permission, requestPermission, notify };
}
