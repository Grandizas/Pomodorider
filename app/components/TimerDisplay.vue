<template>
    <div class="timer-display" :class="`timer-${timerStore.mode}`">
        <div class="timer-display__inner">
            <!-- ----------------- [ Switch buttons (Work, Break) ] ----------------- -->
            <div class="timer-mode">
                <button
                    v-for="mode in modes"
                    :key="mode.value"
                    :class="[
                        'mode-button',
                        { active: timerStore.mode === mode.value },
                    ]"
                    @click="switchMode(mode.value)"
                >
                    {{ mode.label }}
                </button>
            </div>

            <!-- ----------------- [ Timer ] ----------------- -->
            <parts-timer />
            <!-- ----------------- [ Controls ] ----------------- -->
            <parts-timer-controls />

            <!-- ----------------- [ Sessions, Total time ] ----------------- -->
            <div class="timer-stats">
                <div class="stat">
                    <div class="stat-value">
                        {{ timerStore.sessionsCompleted }}
                    </div>
                    <div class="stat-label">Sessions</div>
                </div>

                <div class="stat">
                    <div class="stat-value">{{ formattedWorkTime }}</div>
                    <div class="stat-label">Total Time</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore, type TimerMode } from '~~/stores/timer';
import { Icon } from '@iconify/vue';

const timerStore = useTimerStore();

const modes = [
    { value: 'work' as TimerMode, label: 'Work' },
    { value: 'shortBreak' as TimerMode, label: 'Short Break' },
    { value: 'longBreak' as TimerMode, label: 'Long Break' },
];

const formattedWorkTime = computed(() => {
    const hours = Math.floor(timerStore.totalWorkTime / 3600);
    const minutes = Math.floor((timerStore.totalWorkTime % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
