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
            <svg class="progress-ring" width="300" height="300">
                <circle
                    class="progress-ring-bg"
                    cx="150"
                    cy="150"
                    :r="CIRCLE_RADIUS"
                />
                <circle
                    class="progress-ring-progress"
                    cx="150"
                    cy="150"
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
                Start
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
                Pause
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
                Resume
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
                Reset
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
                Skip
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

const CIRCLE_RADIUS = 140;

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
.timer-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xl;
    padding: $spacing-xl;

    &.timer-work {
        --timer-color: #{$work-color};
    }

    &.timer-shortBreak {
        --timer-color: #{$short-break-color};
    }

    &.timer-longBreak {
        --timer-color: #{$long-break-color};
    }
}

.timer-mode {
    display: flex;
    gap: $spacing-sm;
    background: $surface-color;
    padding: $spacing-xs;
    border-radius: $border-radius-lg;
}

.mode-button {
    padding: $spacing-sm $spacing-md;
    background: transparent;
    color: $text-secondary;
    border-radius: $border-radius-md;
    font-size: 1rem;
    font-weight: 500;
    transition: all $transition-normal;

    &:hover {
        color: $text-color;
    }

    &.active {
        background: var(--timer-color);
        color: white;
    }
}

.timer-circle {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    position: absolute;
    transform: rotate(-90deg);
}

.progress-ring-bg {
    fill: none;
    stroke: $surface-color;
    stroke-width: 12;
}

.progress-ring-progress {
    fill: none;
    stroke: var(--timer-color);
    stroke-width: 12;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
}

.timer-time {
    font-size: 4rem;
    font-weight: 700;
    color: $text-color;
    font-variant-numeric: tabular-nums;
}

.timer-controls {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
    justify-content: center;
}

.control-button {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-md $spacing-lg;
    border-radius: $border-radius-md;
    font-size: 1.1rem;
    font-weight: 600;

    &.start,
    &.resume {
        background: var(--timer-color);
        color: white;
        box-shadow: $shadow-md;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: $shadow-lg;
        }
    }

    &.pause {
        background: #f39c12;
        color: white;
        box-shadow: $shadow-md;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: $shadow-lg;
        }
    }

    &.secondary {
        background: $surface-color;
        color: $text-color;

        &:hover:not(:disabled) {
            background: color-mix(in srgb, $surface-color 95%, white);
        }
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
}

.timer-stats {
    display: flex;
    gap: $spacing-xl;
    margin-top: $spacing-md;
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--timer-color);
}

.stat-label {
    font-size: 0.9rem;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 1px;
}

@media (max-width: 768px) {
    .timer-display {
        gap: $spacing-lg;
    }

    .timer-circle {
        width: 250px;
        height: 250px;
    }

    .progress-ring {
        width: 250px;
        height: 250px;
    }

    .timer-time {
        font-size: 3rem;
    }

    .mode-button {
        padding: $spacing-xs $spacing-sm;
        font-size: 0.9rem;
    }

    .control-button {
        padding: $spacing-sm $spacing-md;
        font-size: 1rem;
    }
}
</style>
