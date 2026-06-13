import { defineStore } from 'pinia';

/**
 * Per-user streak state, mirrored from the `streaks` row plus a derived
 * "days active this week" count. Server-maintained (see the timer_sessions
 * trigger) — the client only reads these values, never computes the streak
 * itself. Streaks are a logged-in-only feature; for anonymous visitors this
 * store stays in its reset/empty state.
 */
export const useStreakStore = defineStore('streak', {
    state: () => ({
        currentStreak: 0,
        longestStreak: 0,
        /** Local 'YYYY-MM-DD' of the last day a work session was completed. */
        lastActivityDate: null as string | null,
        /** Local 'YYYY-MM-DD' the most recent grace-day freeze was consumed (null = never). */
        lastFreezeDate: null as string | null,
        /** Distinct local days with ≥1 work session in the current Mon–Sun week. */
        weekDaysActive: 0,
        /** True once a load() has resolved, so the UI can avoid a 0-flash. */
        loaded: false,
    }),

    getters: {
        /** Length of the weekly ring. */
        weeklyGoal: (): number => 7,
        hasStreak: (state): boolean => state.currentStreak > 0,
    },

    actions: {
        set(data: {
            currentStreak: number;
            longestStreak: number;
            lastActivityDate: string | null;
            lastFreezeDate: string | null;
            weekDaysActive: number;
        }) {
            this.currentStreak = data.currentStreak;
            this.longestStreak = data.longestStreak;
            this.lastActivityDate = data.lastActivityDate;
            this.lastFreezeDate = data.lastFreezeDate;
            this.weekDaysActive = data.weekDaysActive;
            this.loaded = true;
        },

        /** Clear on logout so one account's streak can't show under another. */
        reset() {
            this.currentStreak = 0;
            this.longestStreak = 0;
            this.lastActivityDate = null;
            this.lastFreezeDate = null;
            this.weekDaysActive = 0;
            this.loaded = false;
        },
    },
});
