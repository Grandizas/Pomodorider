import type { Database } from '~/types/database.types';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENT_MAP } from '~~/constants/achievements';

/**
 * Monotonic counter shared across all callers, so a slow load() whose response
 * arrives after a newer one started can detect that and bow out.
 */
let loadSeq = 0;

/**
 * Achievement data access. The DB does all the *unlocking* (a trigger on the
 * streaks table inserts achievement rows); this composable just reads the
 * user's unlocked rows back into the store.
 *
 * On a *reload* (not the initial hydrate) any key that wasn't present before is
 * enqueued for an unlock toast. See `achievements.client.ts` for the wiring.
 */
export function useAchievements() {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const store = useAchievementsStore();

    /** Auth id lives in the JWT `sub` claim; fall back to `id`. Null = logged out. */
    function currentUserId(): string | null {
        const u = user.value as { id?: string; sub?: string } | null;
        return u?.sub ?? u?.id ?? null;
    }

    async function load() {
        const uid = currentUserId();
        if (!uid) {
            store.reset();
            return;
        }

        // Capture pre-load state so we can distinguish genuinely-new unlocks
        // from the initial backlog (which we must not toast).
        const seq = ++loadSeq;
        const wasLoaded = store.loaded;
        const previousKeys = store.unlockedKeys;

        const { data, error } = await supabase
            .from('achievements')
            .select('achievement_key, unlocked_at')
            .eq('user_id', uid)
            .order('unlocked_at', { ascending: true });

        // Bow out if a newer load started, or auth flipped, while we awaited —
        // otherwise a late response could clobber fresher state.
        if (seq !== loadSeq || currentUserId() !== uid) return;
        if (error) {
            console.error('[achievements] failed to load', error);
            return;
        }

        // Drop any keys the backend knows but this client doesn't, so the
        // unlocked count can never exceed the number of defined achievements.
        const rows = (data ?? [])
            .filter((r) => Boolean(ACHIEVEMENT_MAP[r.achievement_key]))
            .map((r) => ({
                key: r.achievement_key,
                unlockedAt: r.unlocked_at,
            }));

        if (wasLoaded) {
            for (const row of rows) {
                if (!previousKeys.has(row.key)) store.enqueueToast(row.key);
            }
        }

        store.set(rows);
    }

    return { load };
}
