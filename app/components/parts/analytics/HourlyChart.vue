<template>
    <div class="hourly-chart">
        <svg
            class="hourly-chart__svg"
            :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
            preserveAspectRatio="none"
            role="img"
            aria-label="Focus minutes by hour of day"
        >
            <g v-for="(bar, i) in bars" :key="i">
                <rect
                    :x="bar.x"
                    :y="CHART_TOP"
                    :width="bar.w"
                    :height="BAR_MAX_H"
                    :rx="RADIUS"
                    class="hourly-chart__track"
                />
                <rect
                    v-if="bar.h > 0"
                    :x="bar.x"
                    :y="bar.y"
                    :width="bar.w"
                    :height="bar.h"
                    :rx="RADIUS"
                    class="hourly-chart__bar"
                    :class="{ 'is-peak': bar.isPeak }"
                >
                    <title>{{ bar.title }}</title>
                </rect>
            </g>
        </svg>

        <div class="hourly-chart__labels" aria-hidden="true">
            <span
                v-for="(bar, i) in bars"
                :key="`l-${i}`"
                class="hourly-chart__label"
            >
                {{ bar.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HourPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

const props = defineProps<{ hours: HourPoint[] }>();

const HEIGHT = 130;
const CHART_TOP = 8;
const BAR_MAX_H = 110;
const STEP = 18;
const GAP = 5;
const RADIUS = 3;
const WIDTH = 24 * STEP;

const maxMinutes = computed(() =>
    props.hours.reduce((m, p) => Math.max(m, p.minutes), 0),
);
const peakHour = computed(() => {
    let peak = -1;
    let best = 0;
    for (const h of props.hours) {
        if (h.minutes > best) {
            best = h.minutes;
            peak = h.hour;
        }
    }
    return peak;
});

/** 0 → "12a", 9 → "9a", 12 → "12p", 18 → "6p". */
function hourLabel(hour: number): string {
    const period = hour < 12 ? 'a' : 'p';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}${period}`;
}

const bars = computed(() => {
    const max = maxMinutes.value;
    return props.hours.map((p, i) => {
        const h = max > 0 ? (p.minutes / max) * BAR_MAX_H : 0;
        const sessions = `${p.sessions} session${p.sessions === 1 ? '' : 's'}`;
        return {
            x: i * STEP + GAP / 2,
            w: STEP - GAP,
            h,
            y: CHART_TOP + (BAR_MAX_H - h),
            isPeak: p.hour === peakHour.value,
            // Label every 3rd hour to avoid a crush.
            label: p.hour % 3 === 0 ? hourLabel(p.hour) : '',
            title: `${hourLabel(p.hour)}: ${formatMinutes(p.minutes)} · ${sessions}`,
        };
    });
});
</script>

<style scoped lang="scss">
.hourly-chart {
    width: 100%;

    &__svg {
        display: block;
        width: 100%;
        height: rem(130px);
    }

    &__track {
        fill: rgba(255, 255, 255, 0.04);
    }

    &__bar {
        fill: $work-color;
        transition: fill $transition-fast;

        &.is-peak {
            fill: #f59e0b;
        }

        &:hover {
            fill: #f59e0b;
        }
    }

    &__labels {
        display: flex;
        margin-top: spacing(1);
    }

    &__label {
        flex: 1 1 0;
        text-align: center;
        font-size: rem(10px);
        color: $text-secondary;
        white-space: nowrap;
    }
}
</style>
