<template>
    <div v-if="streakStore.loaded" class="streak-badge__wrapper">
        <span :class="{ 'is-lit': streakStore.hasStreak }">
            <FontAwesomeIcon
                :icon="['fas', 'fire']"
                class="streak-badge__flame"
            />
        </span>

        <div
            class="streak-badge"
            :title="`Current streak: ${streakStore.currentStreak} day${
                streakStore.currentStreak === 1 ? '' : 's'
            } · Longest: ${streakStore.longestStreak}`"
        >
            <!-- Segmented ring (one segment per streak day, up to 7) wrapping the flame -->
            <svg class="streak-ring" viewBox="0 0 36 36" aria-hidden="true">
                <path
                    v-for="(seg, i) in segments"
                    :key="i"
                    :d="seg.d"
                    class="streak-ring__seg"
                    :class="{ 'is-active': seg.active }"
                />
            </svg>

            <span
                class="streak-badge__center"
                :class="{ 'is-lit': streakStore.hasStreak }"
            >
                <span class="streak-badge__count">{{
                    streakStore.currentStreak
                }}</span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useStreakStore } from '~~/stores/streak';

const streakStore = useStreakStore();

// Geometry for a 7-segment ring on a 36×36 viewBox.
const CX = 18;
const CY = 18;
const R = 15;
const SEGMENTS = 7;
const GAP_DEG = 9; // gap between segments, in degrees
const STEP = 360 / SEGMENTS;
const SEG_DEG = STEP - GAP_DEG;

/** Point on the ring at `angleDeg`, measured clockwise from the top. */
function polar(angleDeg: number): [number, number] {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}

function segPath(startDeg: number, endDeg: number): string {
    const [x1, y1] = polar(startDeg);
    const [x2, y2] = polar(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// Light one segment per streak day, capped at a full ring. Past 7 days the
// ring stays full — a "strong streak" state — and never contradicts the count.
const litSegments = computed(() =>
    Math.min(streakStore.currentStreak, SEGMENTS),
);

const segments = computed(() =>
    Array.from({ length: SEGMENTS }, (_, i) => {
        const start = i * STEP + GAP_DEG / 2;
        return {
            d: segPath(start, start + SEG_DEG),
            active: i < litSegments.value,
        };
    }),
);
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/streak/_streak-badge.scss';
</style>
