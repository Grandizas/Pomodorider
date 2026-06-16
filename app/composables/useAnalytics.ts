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

export interface HourPoint {
    /** Local hour of day, 0–23. */
    hour: number;
    minutes: number;
    sessions: number;
}

/** A single work session, retained for CSV export. */
interface SessionRow {
    completedAt: string;
    day: string;
    minutes: number;
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
    /** Focus split across the 24 hours of the day (local time). */
    const hourly = ref<HourPoint[]>([]);
    /** Raw work sessions, newest first, kept only for CSV export. */
    const rawRows = ref<SessionRow[]>([]);
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
            hourly.value = [];
            rawRows.value = [];
            loading.value = false;
            error.value = null;
            loaded.value = true;
            return;
        }

        const seq = ++loadSeq;
        loading.value = true;
        error.value = null;

        const { data, error: err } = await supabase
            .from('timer_sessions')
            .select('duration_mins, day_bucket, completed_at')
            .eq('user_id', uid)
            .eq('mode', 'work');

        // A newer load started while we awaited: it now owns the loading flag,
        // so bow out WITHOUT touching it (the latest load always settles it).
        if (seq !== loadSeq) return;
        // Auth flipped but we're still the latest load: clear loading ourselves
        // so the UI can't get stuck spinning after a logout mid-flight.
        if (currentUserId() !== uid) {
            loading.value = false;
            return;
        }

        if (err) {
            console.error('[analytics] failed to load sessions', err);
            error.value = 'Could not load your stats. Please try again.';
            loading.value = false;
            return;
        }

        const rows = data ?? [];
        const today = localDayBucket();
        const weekStart = startOfWeekBucket();

        // Roll up per day and per hour in one pass, accumulating totals alongside.
        const perDay = new Map<string, DailyPoint>();
        const perHour: HourPoint[] = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            minutes: 0,
            sessions: 0,
        }));
        const sessionRows: SessionRow[] = [];
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

            // Time-of-day bucket, by the LOCAL hour the session finished.
            const hour = new Date(r.completed_at).getHours();
            const slot = perHour[hour];
            if (slot) {
                slot.minutes += mins;
                slot.sessions += 1;
            }

            sessionRows.push({
                completedAt: r.completed_at,
                day,
                minutes: mins,
            });

            if (day === today) {
                todayMins += mins;
                todaySessions += 1;
            }
            if (day >= weekStart) {
                weekMins += mins;
                weekSessions += 1;
            }
        }

        sessionRows.sort((a, b) =>
            a.completedAt < b.completedAt ? 1 : a.completedAt > b.completedAt ? -1 : 0,
        );

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
        hourly.value = perHour;
        rawRows.value = sessionRows;
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

    /** Build a CSV of every work session (newest first). */
    function buildCsv(): string {
        const header = 'completed_at,day,duration_mins';
        const lines = rawRows.value.map(
            (r) => `${r.completedAt},${r.day},${r.minutes}`,
        );
        return [header, ...lines].join('\n');
    }

    /**
     * Trigger a client-side download of the session CSV. Generated entirely in
     * the browser from the user's own data — no network round-trip. No-ops on
     * the server or when there's nothing to export.
     */
    function exportCsv() {
        if (!import.meta.client || rawRows.value.length === 0) return;
        const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodorider-sessions-${localDayBucket()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        summary,
        dailyAll,
        hourly,
        rawRows,
        loading,
        loaded,
        error,
        load,
        recentSeries,
        exportCsv,
    };
}
