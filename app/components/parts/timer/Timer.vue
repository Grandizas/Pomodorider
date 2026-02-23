<template>
    <div class="timer-orb__wrapper">
        <div class="timer-orb__light" />

        <div class="timer-orb" style="--fill-pct: 28%">
            <div class="timer-orb__bg" />
            <div class="timer-orb__liquid" aria-hidden="true" :style="orbStyle">
                <div class="timer-orb__liquid--bg" />
            </div>
            <div class="timer-orb__time">{{ timerStore.formattedTime }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();

// --fill-pct is used by .timer-orb__liquid { height: var(--fill-pct); }
const orbStyle = computed(() => {
    const totalSeconds = timerStore.getDuration(timerStore.mode) * 60;
    const remaining = timerStore.timeRemaining;

    const progress =
        totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
    const clamped = Math.min(1, Math.max(0, progress));

    return { '--fill-pct': `${Math.round(clamped * 1000) / 10}%` } as Record<
        string,
        string
    >;
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_timer.scss';
</style>
