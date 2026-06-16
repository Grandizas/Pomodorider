<template>
    <div>
        <div class="hours">
            <div v-for="bar in bars" :key="bar.hour" class="hour">
                <div
                    class="hour-fill"
                    :class="{ on: bar.on, peak: bar.isPeak }"
                    :style="{ height: `${bar.height}%` }"
                    :title="bar.title"
                />
            </div>
        </div>
        <div class="hours-axis">
            <span>12a</span><span>3a</span><span>6a</span><span>9a</span>
            <span>12p</span><span>3p</span><span>6p</span><span>9p</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HourPoint } from '~/composables/useAnalytics';
import { formatMinutes } from '~/composables/useAnalytics';

const props = defineProps<{ hours: HourPoint[] }>();

function hourLabel(hour: number): string {
    const period = hour < 12 ? 'a' : 'p';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}${period}`;
}

const maxMinutes = computed(() =>
    props.hours.reduce((m, p) => Math.max(m, p.minutes), 0),
);

const bars = computed(() => {
    const max = maxMinutes.value;
    return props.hours.map((p) => {
        const on = p.minutes > 0;
        const isPeak = max > 0 && p.minutes === max;
        // Lit bars scale to their share (min 18%); empty bars sit as a stub.
        const height = on ? Math.max(18, Math.round((p.minutes / max) * 100)) : 10;
        const sessions = `${p.sessions} session${p.sessions === 1 ? '' : 's'}`;
        return {
            hour: p.hour,
            on,
            isPeak,
            height,
            title: `${hourLabel(p.hour)}: ${formatMinutes(p.minutes)} · ${sessions}`,
        };
    });
});
</script>

<style scoped lang="scss">
.hours {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: rem(5px);
    align-items: end;
    height: rem(130px);
}

.hour {
    height: 100%;
    display: flex;
    align-items: flex-end;
}

.hour-fill {
    width: 100%;
    border-radius: 6px;
    min-height: rem(14px);
    background: rgba(255, 255, 255, 0.04);
    transition: height 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);

    &.on {
        background: linear-gradient(
            180deg,
            rgba(var(--color-timerBg), 0.95),
            rgba(var(--color-timerBg), 0.55)
        );
        box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.18);
    }

    &.peak {
        box-shadow:
            inset 0 2px 8px rgba(255, 255, 255, 0.3),
            0 0 26px rgba(var(--color-timerBg), 0.55);
    }
}

.hours-axis {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    margin-top: rem(12px);
    font-size: rem(11.8px);
    color: $text-secondary;
}
</style>
