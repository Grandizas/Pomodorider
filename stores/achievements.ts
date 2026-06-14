import { defineStore } from 'pinia';

export interface UnlockedAchievement {
    key: string;
    /** ISO timestamp the achievement was unlocked. */
    unlockedAt: string;
}

/**
 * Per-user achievement state, mirrored from the `achievements` table. Like
 * streaks, this is server-maintained (a trigger inserts unlock rows) and the
 * client only reads. Achievements are a logged-in-only feature; anonymous
 * visitors keep this store in its empty state.
 */
export const useAchievementsStore = defineStore('achievements', {
    state: () => ({
        unlocked: [] as UnlockedAchievement[],
        /** True once a load() has resolved. */
        loaded: false,
        /** Keys freshly unlocked this session, awaiting an unlock toast (FIFO). */
        toastQueue: [] as string[],
    }),

    getters: {
        /** Snapshot Set of unlocked keys. */
        unlockedKeys: (state): Set<string> =>
            new Set(state.unlocked.map((u) => u.key)),
        unlockedCount: (state): number => state.unlocked.length,
        isUnlocked:
            (state) =>
            (key: string): boolean =>
                state.unlocked.some((u) => u.key === key),
    },

    actions: {
        set(rows: UnlockedAchievement[]) {
            this.unlocked = rows;
            this.loaded = true;
        },
        enqueueToast(key: string) {
            this.toastQueue.push(key);
        },
        dequeueToast(): string | undefined {
            return this.toastQueue.shift();
        },
        /** Clear on logout so one account's unlocks can't show under another. */
        reset() {
            this.unlocked = [];
            this.loaded = false;
            this.toastQueue = [];
        },
    },
});
