<template>
    <div class="timer-display" :class="`timer-${timerStore.mode}`">
        <div class="timer-display__inner">
            <!-- ----------------- [ Mode selector ] ----------------- -->
            <div class="timer-mode" role="tablist" aria-label="Timer mode">
                <button
                    v-for="m in modes"
                    :key="m.value"
                    role="tab"
                    :aria-selected="timerStore.mode === m.value"
                    :class="[
                        'mode-button',
                        { active: timerStore.mode === m.value },
                    ]"
                    :disabled="timerStore.isRunning"
                    @click="switchMode(m.value)"
                >
                    {{ m.label }}
                </button>
            </div>

            <!-- ----------------- [ Timer ] ----------------- -->
            <parts-timer />
            <!-- ----------------- [ Controls ] ----------------- -->
            <parts-timer-controls />

            <!-- ----------------- [ Stat bar ] ----------------- -->
            <div class="timer-stats">
                <div class="stat">
                    <div class="stat-value">
                        {{ timerStore.sessionsCompleted }}
                    </div>
                    <div class="stat-label">Sessions</div>
                </div>

                <div class="stat__divider" aria-hidden="true" />

                <div class="stat">
                    <div class="stat-value">{{ formattedWorkTime }}</div>
                    <div class="stat-label">Total Time</div>
                </div>

                <template v-if="user && streakStore.loaded">
                    <div class="stat__divider" aria-hidden="true" />

                    <div class="stat">
                        <div class="stat-value stat-value--accent">
                            {{ streakStore.currentStreak }}
                        </div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </template>

                <div class="stat__divider" aria-hidden="true" />

                <div class="stat">
                    <div class="stat-value">{{ cycleLabel }}</div>
                    <div class="stat-label">Cycle</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore, type TimerMode } from '~~/stores/timer';
import { useStreakStore } from '~~/stores/streak';

const timerStore = useTimerStore();
const streakStore = useStreakStore();
const user = useSupabaseUser();

const modes = [
    { value: 'work' as TimerMode, label: 'Focus' },
    { value: 'shortBreak' as TimerMode, label: 'Short break' },
    { value: 'longBreak' as TimerMode, label: 'Long break' },
];

const formattedWorkTime = computed(() => {
    const hours = Math.floor(timerStore.totalWorkTime / 3600);
    const minutes = Math.floor((timerStore.totalWorkTime % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
});

// Position within the current long-break cycle, e.g. "3 of 4".
const cycleLabel = computed(() => {
    const interval = timerStore.settings.longBreakInterval;
    const position = (timerStore.sessionsCompleted % interval) + 1;
    return `${position} of ${interval}`;
});

const switchMode = (mode: TimerMode) => {
    if (!timerStore.isRunning) {
        timerStore.switchMode(mode);
    }
};
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/_timer-display.scss';
</style>
