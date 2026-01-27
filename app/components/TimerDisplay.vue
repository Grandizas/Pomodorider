<template>
    <div class="timer-display" :class="`timer-${timerStore.mode}`">
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

        <div class="timer-circle">
            <svg class="progress-ring" viewBox="0 0 150 150">
                <circle
                    class="progress-ring-bg"
                    cx="75"
                    cy="75"
                    :r="CIRCLE_RADIUS"
                />
                <circle
                    class="progress-ring-progress"
                    cx="75"
                    cy="75"
                    :r="CIRCLE_RADIUS"
                    :style="progressStyle"
                />
            </svg>

            <div class="timer-time">
                {{ timerStore.formattedTime }}
            </div>
        </div>

        <div class="timer-controls">
            <button
                v-if="!timerStore.isRunning && !timerStore.isPaused"
                class="control-button start"
                @click="timerStore.start()"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
                <!--                Start-->
            </button>

            <button
                v-if="timerStore.isRunning"
                class="control-button pause"
                @click="timerStore.pause()"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <!--                Pause-->
            </button>

            <button
                v-if="timerStore.isPaused"
                class="control-button resume"
                @click="timerStore.resume()"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
                <!--                Resume-->
            </button>

            <button
                class="control-button secondary"
                @click="timerStore.reset()"
                :disabled="
                    timerStore.timeRemaining ===
                    timerStore.getDuration(timerStore.mode) * 60
                "
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                    />
                </svg>
                <!--                Reset-->
            </button>

            <button class="control-button secondary" @click="timerStore.skip()">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
                <!--                Skip-->
            </button>
        </div>

        <div class="timer-stats">
            <div class="stat">
                <div class="stat-value">{{ timerStore.sessionsCompleted }}</div>
                <div class="stat-label">Sessions</div>
            </div>

            <div class="stat">
                <div class="stat-value">{{ formattedWorkTime }}</div>
                <div class="stat-label">Total Time</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore, type TimerMode } from '~~/stores/timer';

const timerStore = useTimerStore();

const CIRCLE_RADIUS = 69;

const modes = [
    { value: 'work' as TimerMode, label: 'Work' },
    { value: 'shortBreak' as TimerMode, label: 'Short Break' },
    { value: 'longBreak' as TimerMode, label: 'Long Break' },
];

const progressStyle = computed(() => {
    const circumference = 2 * Math.PI * CIRCLE_RADIUS;
    const offset = circumference - (timerStore.progress / 100) * circumference;
    return {
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset: offset,
    };
});

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
