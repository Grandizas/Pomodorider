import type { Database } from '~/types/database.types';
import { useAchievementsStore } from '~~/stores/achievements';

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
        const wasLoaded = store.loaded;
        const previousKeys = store.unlockedKeys;

        const { data, error } = await supabase
            .from('achievements')
            .select('achievement_key, unlocked_at')
            .eq('user_id', uid)
            .order('unlocked_at', { ascending: true });

        if (currentUserId() !== uid) return; // auth flipped mid-flight
        if (error) {
            console.error('[achievements] failed to load', error);
            return;
        }

        const rows = (data ?? []).map((r) => ({
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
