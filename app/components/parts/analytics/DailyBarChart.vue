<template>
    <div class="bars">
        <div
            v-for="bar in bars"
            :key="bar.day"
            class="bar-col"
            :class="{ peak: bar.isPeak }"
        >
            <div class="bar-track" :title="bar.title">
                <div
                    v-if="bar.pct > 0"
                    class="bar-fill"
                    :class="{ peak: bar.isPeak }"
                    :style="{ height: `${bar.pct}%` }"
                />
            </div>
            <div class="bar-x">{{ bar.label }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DailyPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

const props = defineProps<{ points: DailyPoint[] }>();

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDay(day: string): Date {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** Weekday for short ranges; sparse day-of-month for long ones. */
function labelFor(day: string, index: number, count: number): string {
    const date = parseDay(day);
    if (count <= 10) return WEEKDAY[date.getDay()] ?? '';
    const isEnd = index === 0 || index === count - 1;
    return index % 5 === 0 || isEnd ? String(date.getDate()) : '';
}

const maxMinutes = computed(() =>
    props.points.reduce((m, p) => Math.max(m, p.minutes), 0),
);

const bars = computed(() => {
    const max = maxMinutes.value;
    const count = props.points.length;
    return props.points.map((p, i) => {
        const isPeak = max > 0 && p.minutes === max;
        const pct =
            max > 0 && p.minutes > 0
                ? Math.max(5, Math.round((p.minutes / max) * 100))
                : 0;
        const nice = parseDay(p.day).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
        const sessions = `${p.sessions} session${p.sessions === 1 ? '' : 's'}`;
        return {
            day: p.day,
            isPeak,
            pct,
            label: labelFor(p.day, i, count),
            title: `${nice}: ${formatMinutes(p.minutes)} · ${sessions}`,
        };
    });
});
</script>

<style scoped lang="scss">
.bars {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: rem(14px);
    align-items: end;
}

.bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(12px);

    &.peak .bar-x {
        color: rgb(var(--color-timerBg));
        font-weight: 600;
    }
}

.bar-track {
    width: 100%;
    height: rem(150px);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    position: relative;
}

.bar-fill {
    width: 100%;
    border-radius: 12px;
    min-height: 4px;
    background: linear-gradient(
        180deg,
        rgba(var(--color-timerBg), 0.98) 0%,
        rgba(var(--color-timerBg), 0.62) 100%
    );
    box-shadow:
        inset 0 2px 8px rgba(255, 255, 255, 0.18),
        0 -2px 22px rgba(var(--color-timerBg), 0.3);
    transition: height 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);

    &.peak {
        box-shadow:
            inset 0 2px 10px rgba(255, 255, 255, 0.28),
            0 0 34px rgba(var(--color-timerBg), 0.55);
    }
}

.bar-x {
    font-size: rem(12.8px);
    color: $text-secondary;
}
</style>
