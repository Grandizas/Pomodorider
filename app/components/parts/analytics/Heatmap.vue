<template>
    <div class="heat-wrap">
        <div class="heat-months">
            <span v-for="(m, i) in monthLabels" :key="i">{{ m }}</span>
        </div>

        <div class="heat-days">
            <span>Mon</span><span /><span>Wed</span><span /><span>Fri</span>
            <span /><span />
        </div>

        <div class="heat-grid">
            <div
                v-for="(cell, i) in cells"
                :key="i"
                class="cell"
                :class="cell.level ? `l${cell.level}` : ''"
                :title="cell.title"
            />
        </div>

        <div class="heat-legend">
            Less
            <span class="cell" />
            <span class="cell l1" />
            <span class="cell l2" />
            <span class="cell l3" />
            <span class="cell l4" />
            More
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DailyPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

// `points` must be contiguous days, oldest → newest, ending today.
const props = defineProps<{ points: DailyPoint[] }>();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

/**
 * Cells in column-major order to match `grid-auto-flow: column` over 7 rows:
 * lead with blank placeholders so the first real day lands on its weekday row.
 */
const cells = computed(() => {
    const lead = props.points.length
        ? weekdayIndex(parseDay(props.points[0]!.day))
        : 0;
    const placeholders = Array.from({ length: lead }, () => ({
        level: 0,
        title: '',
    }));
    const days = props.points.map((p) => {
        const nice = parseDay(p.day).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        return {
            level: levelFor(p.minutes),
            title: `${nice}: ${formatMinutes(p.minutes)}`,
        };
    });
    return [...placeholders, ...days];
});

/** Distinct months spanned by the range, in order, spread across the top. */
const monthLabels = computed(() => {
    const out: string[] = [];
    let last = -1;
    for (const p of props.points) {
        const month = parseDay(p.day).getMonth();
        if (month !== last) {
            out.push(MONTHS[month]!);
            last = month;
        }
    }
    return out;
});
</script>

<style scoped lang="scss">
.heat-wrap {
    display: grid;
    grid-template-columns: auto auto;
    gap: rem(10px) rem(14px);
    width: fit-content;
    margin: rem(4px) auto 0;
    max-width: 100%;
    overflow-x: auto;
}

.heat-months {
    grid-column: 2;
    display: flex;
    justify-content: space-between;
    font-size: rem(12.5px);
    color: $text-secondary;
    padding-bottom: 2px;
}

.heat-days {
    grid-column: 1;
    display: grid;
    grid-template-rows: repeat(7, 26px);
    gap: 6px;
    font-size: rem(11.5px);
    color: $text-secondary;
    align-items: center;
    padding-top: 2px;
}

.heat-grid {
    grid-column: 2;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, 26px);
    grid-auto-columns: 26px;
    gap: 6px;
}

.cell {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.035);

    &.l1 {
        background: rgba(var(--color-timerBg), 0.28);
    }
    &.l2 {
        background: rgba(var(--color-timerBg), 0.5);
    }
    &.l3 {
        background: rgba(var(--color-timerBg), 0.74);
    }
    &.l4 {
        background: rgb(var(--color-timerBg));
        box-shadow: 0 0 12px rgba(var(--color-timerBg), 0.55);
    }
}

.heat-legend {
    grid-column: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    margin-top: rem(14px);
    font-size: rem(12.5px);
    color: $text-secondary;

    .cell {
        width: 14px;
        height: 14px;
    }
}
</style>
