import type { Json, Database } from '~/types/database.types';
import { useTimerStore, type TimerSettings } from '~~/stores/timer';
import { useThemeStore } from '~~/stores/theme';
import { type ThemeKey, themes } from '~~/themes/themes';

/**
 * Persisted shape stored both in localStorage (all visitors) and in
 * `profiles.settings_json` (authenticated users). `version` lets us migrate the
 * shape in the future without misreading older blobs.
 */
interface PersistedSettings {
    version: number;
    timer: TimerSettings;
    theme: ThemeKey;
}

const STORAGE_KEY = 'pomodorider:settings';
const SCHEMA_VERSION = 1;
const SAVE_DEBOUNCE_MS = 800;

// Module-scoped so the debounce timer and the "applying" guard are shared
// regardless of how many times the composable is invoked.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let applying = false;

/**
 * Settings persistence: localStorage is a fast cache for everyone, the DB is the
 * source of truth for logged-in users. See `settings.client.ts` for the wiring
 * (load on startup, persist on change, react to login/logout).
 */
export function useUserSettings() {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const timerStore = useTimerStore();
    const themeStore = useThemeStore();

    /**
     * The authenticated user's id. `useSupabaseUser()` returns decoded JWT
     * claims, where the id lives in `sub` (not `id`), so read `sub` first and
     * fall back to `id` for forward compatibility. Null when logged out.
     */
    function currentUserId(): string | null {
        const u = user.value as { id?: string; sub?: string } | null;
        return u?.sub ?? u?.id ?? null;
    }

    /** Current settings as a plain, JSON-safe snapshot. */
    function snapshot(): PersistedSettings {
        return {
            version: SCHEMA_VERSION,
            timer: {
                ...timerStore.settings,
                sounds: { ...timerStore.settings.sounds },
            },
            theme: themeStore.activeTheme,
        };
    }

    /** Best-effort validation of an untrusted blob from storage or the DB. */
    function coerce(value: unknown): PersistedSettings | null {
        if (!value || typeof value !== 'object') return null;
        const data = value as Partial<PersistedSettings>;
        if (!data.timer || typeof data.timer !== 'object') return null;
        return {
            version: typeof data.version === 'number' ? data.version : 0,
            timer: data.timer as TimerSettings,
            theme:
                data.theme && data.theme in themes
                    ? (data.theme as ThemeKey)
                    : themeStore.activeTheme,
        };
    }

    /** Push persisted settings into the live stores. */
    function apply(data: PersistedSettings) {
        applying = true;
        try {
            timerStore.updateSettings(data.timer);
            themeStore.applyTheme(data.theme);
        } finally {
            // Watchers flush before nextTick resolves, so by the time this runs
            // the change-driven persist has already been skipped.
            nextTick(() => {
                applying = false;
            });
        }
    }

    function readLocal(): PersistedSettings | null {
        if (import.meta.server) return null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? coerce(JSON.parse(raw)) : null;
        } catch {
            return null;
        }
    }

    function writeLocal(data: PersistedSettings) {
        if (import.meta.server) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Quota or privacy-mode failures are non-fatal.
        }
    }

    async function fetchRemote(): Promise<PersistedSettings | null> {
        const uid = currentUserId();
        if (!uid) return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('settings_json')
            .eq('id', uid)
            .maybeSingle();
        if (error) {
            console.error('[settings] failed to fetch remote settings', error);
            return null;
        }
        return coerce(data?.settings_json ?? null);
    }

    async function saveRemote(data: PersistedSettings) {
        const uid = currentUserId();
        if (!uid) return;
        const { error } = await supabase.from('profiles').upsert(
            {
                id: uid,
                settings_json: data as unknown as Json,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
        );
        if (error) {
            console.error('[settings] failed to save remote settings', error);
        }
    }

    /**
     * Hydrate on startup or after an auth change:
     *  1. apply the local cache immediately (no flash, works offline),
     *  2. if logged in, let the DB win — or migrate the local cache up when the
     *     account has no settings saved yet.
     */
    async function load() {
        const local = readLocal();
        if (local) apply(local);

        if (!currentUserId()) return;

        const remote = await fetchRemote();
        if (remote) {
            apply(remote);
            writeLocal(remote);
        } else if (local) {
            await saveRemote(local);
        }
    }

    /** Cache locally now; debounce the DB write for logged-in users. */
    function persist() {
        if (applying) return;
        const data = snapshot();
        writeLocal(data);

        if (!currentUserId()) return;
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveTimer = null;
            void saveRemote(data);
        }, SAVE_DEBOUNCE_MS);
    }

    return { load, persist };
}
