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

const STORAGE_PREFIX = 'pomodorider:settings';
const ANON_KEY = `${STORAGE_PREFIX}:anon`;
const SCHEMA_VERSION = 1;
const SAVE_DEBOUNCE_MS = 800;

/** localStorage key for a given identity. Per-user so one account's cached
 * settings can never leak into another's on a shared browser. */
const keyFor = (uid: string | null) =>
    uid ? `${STORAGE_PREFIX}:${uid}` : ANON_KEY;

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

    // Field-level coercers: keep a value only if it has the expected type,
    // otherwise fall back to the current (known-good) default.
    const num = (v: unknown, fallback: number) =>
        typeof v === 'number' && Number.isFinite(v) ? v : fallback;
    const bool = (v: unknown, fallback: boolean) =>
        typeof v === 'boolean' ? v : fallback;
    const str = (v: unknown, fallback: string) =>
        typeof v === 'string' && v ? v : fallback;

    /**
     * Rebuild a TimerSettings object field-by-field from a known-good default,
     * so a stale or corrupt blob can't inject missing fields, NaN durations, or
     * numbers-as-strings into the store.
     */
    function normalizeTimer(raw: unknown): TimerSettings {
        const d = timerStore.settings;
        const t = (raw && typeof raw === 'object' ? raw : {}) as Record<
            string,
            unknown
        >;
        const s = (
            t.sounds && typeof t.sounds === 'object' ? t.sounds : {}
        ) as Record<string, unknown>;
        return {
            workDuration: num(t.workDuration, d.workDuration),
            shortBreakDuration: num(t.shortBreakDuration, d.shortBreakDuration),
            longBreakDuration: num(t.longBreakDuration, d.longBreakDuration),
            longBreakInterval: num(t.longBreakInterval, d.longBreakInterval),
            autoStartBreaks: bool(t.autoStartBreaks, d.autoStartBreaks),
            autoStartWork: bool(t.autoStartWork, d.autoStartWork),
            soundEnabled: bool(t.soundEnabled, d.soundEnabled),
            soundVolume: num(t.soundVolume, d.soundVolume),
            sounds: {
                start: str(s.start, d.sounds.start),
                pause: str(s.pause, d.sounds.pause),
                end: str(s.end, d.sounds.end),
            },
        };
    }

    /** Validate + normalize an untrusted blob from storage or the DB. */
    function coerce(value: unknown): PersistedSettings | null {
        if (!value || typeof value !== 'object') return null;
        const data = value as Partial<PersistedSettings>;
        // Reject unknown/future schema versions rather than misreading them.
        if (typeof data.version !== 'number' || data.version > SCHEMA_VERSION) {
            return null;
        }
        return {
            version: SCHEMA_VERSION,
            timer: normalizeTimer(data.timer),
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

    function readLocal(key: string): PersistedSettings | null {
        if (import.meta.server) return null;
        try {
            const raw = localStorage.getItem(key);
            return raw ? coerce(JSON.parse(raw)) : null;
        } catch {
            return null;
        }
    }

    function writeLocal(key: string, data: PersistedSettings) {
        if (import.meta.server) return;
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch {
            // Quota or privacy-mode failures are non-fatal.
        }
    }

    /** One-time move of the pre-namespacing global cache into the anon slot. */
    function migrateLegacyKey() {
        if (import.meta.server) return;
        try {
            const legacy = localStorage.getItem(STORAGE_PREFIX);
            if (!legacy) return;
            if (!localStorage.getItem(ANON_KEY)) {
                localStorage.setItem(ANON_KEY, legacy);
            }
            localStorage.removeItem(STORAGE_PREFIX);
        } catch {
            // Ignore — non-critical.
        }
    }

    function clearPendingSave() {
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
        }
    }

    async function fetchRemote(uid: string): Promise<PersistedSettings | null> {
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

    async function saveRemote(uid: string, data: PersistedSettings) {
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
     *  1. apply this identity's own cache immediately (no flash, works offline),
     *  2. if logged in, let the DB win — or, for a brand-new account, migrate the
     *     anonymous cache up (then clear it so it can't seed a different user).
     *
     * The work is bound to the uid captured at the start: an auth change while a
     * fetch/save is in flight abandons the stale result instead of applying or
     * writing it under the wrong account.
     */
    async function load() {
        clearPendingSave();
        migrateLegacyKey();

        const uid = currentUserId();
        const own = readLocal(keyFor(uid));
        if (own) apply(own);

        if (!uid) return;

        const remote = await fetchRemote(uid);
        if (currentUserId() !== uid) return; // auth flipped mid-flight

        if (remote) {
            apply(remote);
            writeLocal(keyFor(uid), remote);
            return;
        }

        // New account with nothing saved yet: seed from the anonymous cache.
        const seed = own ?? readLocal(ANON_KEY);
        if (!seed) return;
        apply(seed);
        writeLocal(keyFor(uid), seed);
        await saveRemote(uid, seed);
        if (currentUserId() === uid && !import.meta.server) {
            localStorage.removeItem(ANON_KEY);
        }
    }

    /** Cache locally now; debounce the DB write for logged-in users. */
    function persist() {
        if (applying) return;
        const uid = currentUserId();
        const data = snapshot();
        writeLocal(keyFor(uid), data);

        if (!uid) return;
        clearPendingSave();
        saveTimer = setTimeout(() => {
            saveTimer = null;
            // Drop the write if auth changed during the debounce window, so one
            // account's snapshot is never written into another's profile.
            if (currentUserId() !== uid) return;
            void saveRemote(uid, data);
        }, SAVE_DEBOUNCE_MS);
    }

    return { load, persist };
}
