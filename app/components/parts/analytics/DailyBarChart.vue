<template>
    <div class="daily-chart">
        <svg
            class="daily-chart__svg"
            :viewBox="`0 0 ${width} ${HEIGHT}`"
            preserveAspectRatio="none"
            role="img"
            :aria-label="`Focus minutes over the last ${points.length} days`"
        >
            <g v-for="(bar, i) in bars" :key="bar.day">
                <!-- Track behind each bar, so empty days still read as a slot -->
                <rect
                    :x="bar.x"
                    :y="CHART_TOP"
                    :width="bar.w"
                    :height="BAR_MAX_H"
                    :rx="RADIUS"
                    class="daily-chart__track"
                />
                <rect
                    v-if="bar.h > 0"
                    :x="bar.x"
                    :y="bar.y"
                    :width="bar.w"
                    :height="bar.h"
                    :rx="RADIUS"
                    class="daily-chart__bar"
                    :class="{ 'is-today': i === bars.length - 1 }"
                >
                    <title>{{ bar.title }}</title>
                </rect>
            </g>
        </svg>

        <div class="daily-chart__labels" aria-hidden="true">
            <span v-for="bar in bars" :key="bar.day" class="daily-chart__label">
                {{ bar.label }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DailyPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

const props = defineProps<{ points: DailyPoint[] }>();

// Coordinate system — width scales with the number of days; the SVG stretches
// to fill its container via preserveAspectRatio="none".
const HEIGHT = 140;
const CHART_TOP = 8;
const BAR_MAX_H = 120;
const STEP = 32;
const GAP = 10;
const RADIUS = 4;

const width = computed(() => Math.max(props.points.length * STEP, STEP));

const maxMinutes = computed(() =>
    props.points.reduce((m, p) => Math.max(m, p.minutes), 0),
);

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** A bar's axis label: weekday for short ranges, day-of-month (sparse) for long. */
function labelFor(day: string, index: number, count: number): string {
    // day is 'YYYY-MM-DD'; build a local Date without timezone drift.
    const [y, m, d] = day.split('-').map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    if (count <= 10) return WEEKDAY[date.getDay()] ?? '';
    // Longer ranges: only label roughly every 5th day to avoid a crush.
    const isEnd = index === 0 || index === count - 1;
    return index % 5 === 0 || isEnd ? String(date.getDate()) : '';
}

function titleFor(day: string, p: DailyPoint): string {
    const [y, m, d] = day.split('-').map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    const nice = date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const sessions = `${p.sessions} session${p.sessions === 1 ? '' : 's'}`;
    return `${nice}: ${formatMinutes(p.minutes)} · ${sessions}`;
}

const bars = computed(() => {
    const max = maxMinutes.value;
    const count = props.points.length;
    return props.points.map((p, i) => {
        const h = max > 0 ? (p.minutes / max) * BAR_MAX_H : 0;
        return {
            day: p.day,
            x: i * STEP + GAP / 2,
            w: STEP - GAP,
            h,
            y: CHART_TOP + (BAR_MAX_H - h),
            label: labelFor(p.day, i, count),
            title: titleFor(p.day, p),
        };
    });
});
</script>

<style scoped lang="scss">
.daily-chart {
    width: 100%;

    &__svg {
        display: block;
        width: 100%;
        height: rem(140px);
    }

    &__track {
        fill: rgba(255, 255, 255, 0.04);
    }

    &__bar {
        fill: $work-color;
        transition: fill $transition-fast;

        &.is-today {
            fill: #f59e0b; // amber — matches the lit streak segments
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
        font-size: rem(11px);
        color: $text-secondary;
        white-space: nowrap;
    }
}
</style>
