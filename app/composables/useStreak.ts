import type { Database } from '~/types/database.types';
import type { TimerMode } from '~~/stores/timer';
import { useStreakStore } from '~~/stores/streak';

/**
 * Streak data access. The DB does all the streak *math* (a trigger on
 * timer_sessions maintains the streaks row); this composable just records
 * completed sessions and reads the results back into the streak store.
 *
 * Day boundaries are computed in the user's LOCAL time, not UTC, so "today"
 * matches what the user sees on their clock — a session finished at 11pm counts
 * for that day even if it's already past midnight UTC.
 *
 * See `streak.client.ts` for the wiring (load on auth change, record on
 * completion).
 */
export function useStreak() {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const streakStore = useStreakStore();

    /** Auth id lives in the JWT `sub` claim; fall back to `id`. Null = logged out. */
    function currentUserId(): string | null {
        const u = user.value as { id?: string; sub?: string } | null;
        return u?.sub ?? u?.id ?? null;
    }

    /** Local calendar day as 'YYYY-MM-DD' (matches the DB `date` day_bucket). */
    function localDayBucket(d = new Date()): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /** Monday of the current local week, as a 'YYYY-MM-DD' bucket. */
    function startOfWeekBucket(d = new Date()): string {
        const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const daysSinceMonday = (date.getDay() + 6) % 7; // getDay: 0=Sun..6=Sat
        date.setDate(date.getDate() - daysSinceMonday);
        return localDayBucket(date);
    }

    /** Count distinct local days with ≥1 work session since `weekStart`. */
    async function fetchWeekDaysActive(
        uid: string,
        weekStart: string,
    ): Promise<number> {
        const { data, error } = await supabase
            .from('timer_sessions')
            .select('day_bucket')
            .eq('user_id', uid)
            .eq('mode', 'work')
            .gte('day_bucket', weekStart);
        if (error) {
            console.error('[streak] failed to fetch weekly sessions', error);
            return streakStore.weekDaysActive; // keep last-known on failure
        }
        const days = new Set((data ?? []).map((r) => r.day_bucket));
        return days.size;
    }

    /**
     * Pull the streak row + this week's active-day count into the store. No-ops
     * to a reset state when logged out. Bound to the uid captured at the start
     * so an auth change mid-flight can't apply a stale result to a new account.
     */
    async function load() {
        const uid = currentUserId();
        if (!uid) {
            streakStore.reset();
            return;
        }

        const [{ data: row, error }, weekDaysActive] = await Promise.all([
            supabase
                .from('streaks')
                .select(
                    'current_streak, longest_streak, last_activity_date, last_freeze_date',
                )
                .eq('user_id', uid)
                .maybeSingle(),
            fetchWeekDaysActive(uid, startOfWeekBucket()),
        ]);

        if (currentUserId() !== uid) return; // auth flipped mid-flight
        if (error) {
            console.error('[streak] failed to fetch streak', error);
            return;
        }

        streakStore.set({
            currentStreak: row?.current_streak ?? 0,
            longestStreak: row?.longest_streak ?? 0,
            lastActivityDate: row?.last_activity_date ?? null,
            lastFreezeDate: row?.last_freeze_date ?? null,
            weekDaysActive,
        });
    }

    /**
     * Record one completed session. The streak trigger updates the streaks row
     * as part of this insert; we then reload to reflect the new counts. Silently
     * no-ops when logged out (streaks are logged-in-only).
     */
    async function recordSession(mode: TimerMode, durationMins: number) {
        const uid = currentUserId();
        if (!uid) return;

        const { error } = await supabase.from('timer_sessions').insert({
            user_id: uid,
            mode,
            duration_mins: durationMins,
            day_bucket: localDayBucket(),
        });
        if (error) {
            console.error('[streak] failed to record session', error);
            return;
        }

        if (currentUserId() === uid) await load();
    }

    return { load, recordSession };
}
