import type { Database } from '~/types/database.types';

/**
 * Focus analytics, derived entirely from the `timer_sessions` rows the streak
 * system already writes — no schema changes, no separate tracking. We read the
 * user's own work sessions once and aggregate client-side (a power user has at
 * most a few thousand rows; if that ever grows we can move the rollup into a
 * Postgres RPC).
 *
 * Analytics are logged-in-only, like streaks/achievements: anonymous visitors
 * get an empty summary and the page shows a sign-in prompt instead.
 *
 * Day boundaries match `useStreak`: local calendar days, so "today" lines up
 * with the user's clock rather than UTC.
 */

export interface AnalyticsSummary {
    totalFocusMins: number;
    totalSessions: number;
    todayFocusMins: number;
    todaySessions: number;
    weekFocusMins: number;
    weekSessions: number;
    /** Single most productive day, or null if there's no data yet. */
    bestDay: { day: string; minutes: number } | null;
}

export interface DailyPoint {
    /** Local 'YYYY-MM-DD'. */
    day: string;
    minutes: number;
    sessions: number;
}

/** Local calendar day as 'YYYY-MM-DD' (matches the DB `day_bucket`). */
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

/** Human-friendly minutes, e.g. 0 → "0m", 75 → "1h 15m", 120 → "2h". */
export function formatMinutes(mins: number): string {
    const total = Math.round(mins);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}

const EMPTY_SUMMARY: AnalyticsSummary = {
    totalFocusMins: 0,
    totalSessions: 0,
    todayFocusMins: 0,
    todaySessions: 0,
    weekFocusMins: 0,
    weekSessions: 0,
    bestDay: null,
};

/** Monotonic guard so a slow load resolving after a newer one bows out. */
let loadSeq = 0;

export function useAnalytics() {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();

    const summary = ref<AnalyticsSummary>({ ...EMPTY_SUMMARY });
    /** Per-day rollup of every work session, ascending by day. */
    const dailyAll = ref<DailyPoint[]>([]);
    const loading = ref(false);
    const loaded = ref(false);
    const error = ref<string | null>(null);

    /** Auth id lives in the JWT `sub` claim; fall back to `id`. Null = logged out. */
    function currentUserId(): string | null {
        const u = user.value as { id?: string; sub?: string } | null;
        return u?.sub ?? u?.id ?? null;
    }

    /**
     * The most recent `days` calendar days (oldest → newest), zero-filling any
     * day with no sessions so the chart always renders a continuous range.
     */
    function recentSeries(days: number): DailyPoint[] {
        const byDay = new Map(dailyAll.value.map((p) => [p.day, p]));
        const out: DailyPoint[] = [];
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        cursor.setDate(cursor.getDate() - (days - 1));
        for (let i = 0; i < days; i++) {
            const day = localDayBucket(cursor);
            out.push(byDay.get(day) ?? { day, minutes: 0, sessions: 0 });
            cursor.setDate(cursor.getDate() + 1);
        }
        return out;
    }

    async function load() {
        const uid = currentUserId();
        if (!uid) {
            summary.value = { ...EMPTY_SUMMARY };
            dailyAll.value = [];
            loaded.value = true;
            return;
        }

        const seq = ++loadSeq;
        loading.value = true;
        error.value = null;

        const { data, error: err } = await supabase
            .from('timer_sessions')
            .select('duration_mins, day_bucket')
            .eq('user_id', uid)
            .eq('mode', 'work');

        // Bow out if a newer load started or auth flipped while awaiting.
        if (seq !== loadSeq || currentUserId() !== uid) return;

        if (err) {
            console.error('[analytics] failed to load sessions', err);
            error.value = 'Could not load your stats. Please try again.';
            loading.value = false;
            return;
        }

        const rows = data ?? [];
        const today = localDayBucket();
        const weekStart = startOfWeekBucket();

        // Roll up per day in one pass, accumulating the totals alongside.
        const perDay = new Map<string, DailyPoint>();
        let totalMins = 0;
        let todayMins = 0;
        let todaySessions = 0;
        let weekMins = 0;
        let weekSessions = 0;

        for (const r of rows) {
            const mins = r.duration_mins ?? 0;
            const day = r.day_bucket;
            totalMins += mins;

            const point = perDay.get(day) ?? { day, minutes: 0, sessions: 0 };
            point.minutes += mins;
            point.sessions += 1;
            perDay.set(day, point);

            if (day === today) {
                todayMins += mins;
                todaySessions += 1;
            }
            if (day >= weekStart) {
                weekMins += mins;
                weekSessions += 1;
            }
        }

        const sorted = [...perDay.values()].sort((a, b) =>
            a.day < b.day ? -1 : a.day > b.day ? 1 : 0,
        );
        const bestDay = sorted.reduce<{ day: string; minutes: number } | null>(
            (best, p) =>
                !best || p.minutes > best.minutes
                    ? { day: p.day, minutes: p.minutes }
                    : best,
            null,
        );

        dailyAll.value = sorted;
        summary.value = {
            totalFocusMins: totalMins,
            totalSessions: rows.length,
            todayFocusMins: todayMins,
            todaySessions,
            weekFocusMins: weekMins,
            weekSessions,
            bestDay,
        };
        loaded.value = true;
        loading.value = false;
    }

    return {
        summary,
        dailyAll,
        loading,
        loaded,
        error,
        load,
        recentSeries,
    };
}
