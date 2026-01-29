<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();

const CIRCLE_RADIUS = 69;

const progressStyle = computed(() => {
    const circumference = 2 * Math.PI * CIRCLE_RADIUS;
    const offset = circumference - (timerStore.progress / 100) * circumference;
    return {
        strokeDasharray: `${circumference} ${circumference}`,
        strokeDashoffset: offset,
    };
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_timer.scss';
</style>
