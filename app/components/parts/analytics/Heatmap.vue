<template>
    <div class="heatmap">
        <svg
            class="heatmap__svg"
            :viewBox="`0 0 ${width} ${height}`"
            role="img"
            aria-label="Focus minutes per day"
        >
            <!-- Month labels along the top -->
            <text
                v-for="m in monthLabels"
                :key="`m-${m.col}`"
                :x="LEFT + m.col * STEP"
                :y="11"
                class="heatmap__month"
            >
                {{ m.label }}
            </text>

            <!-- Weekday labels (Mon/Wed/Fri) down the left -->
            <text
                v-for="w in WEEKDAY_LABELS"
                :key="`w-${w.row}`"
                :x="0"
                :y="TOP + w.row * STEP + CELL - 2"
                class="heatmap__weekday"
            >
                {{ w.label }}
            </text>

            <rect
                v-for="cell in cells"
                :key="cell.day"
                :x="cell.x"
                :y="cell.y"
                :width="CELL"
                :height="CELL"
                :rx="2"
                class="heatmap__cell"
                :class="`is-l${cell.level}`"
            >
                <title>{{ cell.title }}</title>
            </rect>
        </svg>

        <div class="heatmap__legend">
            <span>Less</span>
            <span class="heatmap__swatch is-l0" />
            <span class="heatmap__swatch is-l1" />
            <span class="heatmap__swatch is-l2" />
            <span class="heatmap__swatch is-l3" />
            <span class="heatmap__swatch is-l4" />
            <span>More</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DailyPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

// `points` must be contiguous days, oldest → newest, ending today.
const props = defineProps<{ points: DailyPoint[] }>();

const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;
const TOP = 18; // room for month labels
const LEFT = 26; // room for weekday labels

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = [
    { row: 0, label: 'Mon' },
    { row: 2, label: 'Wed' },
    { row: 4, label: 'Fri' },
];

/** Parse 'YYYY-MM-DD' into a local Date with no timezone drift. */
function parseDay(day: string): Date {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** Monday-based weekday index: Mon=0 … Sun=6. */
function weekdayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
}

const maxMinutes = computed(() =>
    props.points.reduce((m, p) => Math.max(m, p.minutes), 0),
);

/** 0 (none) … 4 (most), relative to the busiest day in the range. */
function levelFor(minutes: number): number {
    if (minutes <= 0) return 0;
    const max = maxMinutes.value || 1;
    const ratio = minutes / max;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
}

/** Lead offset so the first column starts on the Monday of that week. */
const leadOffset = computed(() =>
    props.points.length ? weekdayIndex(parseDay(props.points[0]!.day)) : 0,
);

const cells = computed(() =>
    props.points.map((p, i) => {
        const pos = leadOffset.value + i;
        const col = Math.floor(pos / 7);
        const row = pos % 7;
        const nice = parseDay(p.day).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        return {
            day: p.day,
            x: LEFT + col * STEP,
            y: TOP + row * STEP,
            level: levelFor(p.minutes),
            title: `${nice}: ${formatMinutes(p.minutes)}`,
        };
    }),
);

const numCols = computed(() =>
    Math.ceil((leadOffset.value + props.points.length) / 7),
);

const width = computed(() => LEFT + numCols.value * STEP);
const height = computed(() => TOP + 7 * STEP);

/** One label per column where the month first appears. */
const monthLabels = computed(() => {
    const out: { col: number; label: string }[] = [];
    let lastMonth = -1;
    props.points.forEach((p, i) => {
        if (weekdayIndex(parseDay(p.day)) !== 0) return; // only top-row cells
        const month = parseDay(p.day).getMonth();
        if (month !== lastMonth) {
            const col = Math.floor((leadOffset.value + i) / 7);
            out.push({ col, label: MONTHS[month]! });
            lastMonth = month;
        }
    });
    return out;
});
</script>

<style scoped lang="scss">
.heatmap {
    width: 100%;
    overflow-x: auto;

    &__svg {
        display: block;
        max-width: 100%;
        height: auto;
    }

    &__month,
    &__weekday {
        fill: $text-secondary;
        font-size: 9px;
    }

    &__cell {
        stroke: rgba(0, 0, 0, 0.2);
        stroke-width: 0.5;
    }

    // Amber intensity scale — shared by cells and the legend swatches.
    .is-l0 {
        fill: rgba(255, 255, 255, 0.05);
    }
    .is-l1 {
        fill: rgba(245, 158, 11, 0.28);
    }
    .is-l2 {
        fill: rgba(245, 158, 11, 0.5);
    }
    .is-l3 {
        fill: rgba(245, 158, 11, 0.74);
    }
    .is-l4 {
        fill: #f59e0b;
    }

    &__legend {
        display: flex;
        align-items: center;
        gap: spacing(0.5);
        margin-top: spacing(1);
        font-size: rem(11px);
        color: $text-secondary;
    }

    &__swatch {
        width: rem(12px);
        height: rem(12px);
        border-radius: $radius-xss;
        display: inline-block;

        &.is-l0 {
            background: rgba(255, 255, 255, 0.05);
        }
        &.is-l1 {
            background: rgba(245, 158, 11, 0.28);
        }
        &.is-l2 {
            background: rgba(245, 158, 11, 0.5);
        }
        &.is-l3 {
            background: rgba(245, 158, 11, 0.74);
        }
        &.is-l4 {
            background: #f59e0b;
        }
    }
}
</style>
