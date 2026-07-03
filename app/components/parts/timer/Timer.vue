<template>
    <div class="timer-orb__wrapper" :style="orbStyle">
        <div class="timer-orb__light" />

        <!-- conic progress ring wrapping the orb -->
        <div class="timer-orb__ring" aria-hidden="true" />

        <div class="timer-orb">
            <div class="timer-orb__bg" />
            <div class="timer-orb__liquid" aria-hidden="true">
                <div class="timer-orb__liquid--bg" />
                <!-- lit, wavy surface line on top of the liquid -->
                <div class="timer-orb__surface" />
                <!-- bubbles rising through the liquid -->
                <span class="timer-orb__bubble" />
                <span class="timer-orb__bubble" />
                <span class="timer-orb__bubble" />
            </div>
            <!-- glassy specular highlight for the 3D top sheen -->
            <div class="timer-orb__gloss" aria-hidden="true" />
            <div class="timer-orb__readout">
                <div class="timer-orb__time">
                    {{ timerStore.formattedTime }}
                </div>
                <div class="timer-orb__pct">{{ progressPct }}% complete</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();

// Fraction of the current session elapsed (0–1), clamped.
const progress = computed(() => {
    const totalSeconds = timerStore.getDuration(timerStore.mode) * 60;
    const remaining = timerStore.timeRemaining;

    const p = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
    return Math.min(1, Math.max(0, p));
});

const progressPct = computed(() => Math.round(progress.value * 100));

// --fill-pct drives the liquid height; --progress drives the conic ring sweep.
// Both carry full precision (not the rounded label value) and share a `1s linear`
// CSS transition, so the ring and the liquid glide together on every tick rather
// than stepping. Both live on the wrapper so the orb's liquid and the sibling
// ring inherit them.
const orbStyle = computed(() => {
    const pct = progress.value * 100;
    return {
        '--fill-pct': `${pct}%`,
        '--progress': String(pct),
    } as Record<string, string>;
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_timer.scss';
</style>
