<template>
    <div class="streak-orb" :style="{ '--fill': `${clampedFill}%` }">
        <div class="halo" />
        <div class="liquid" />
        <div class="core">
            <div class="num">{{ count }}</div>
            <div class="lab">{{ label }}</div>
        </div>
        <div class="noise" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        count: number;
        /** 0–100; how full the orb sits, e.g. progress to the next milestone. */
        fill: number;
        label?: string;
    }>(),
    { label: 'day streak' },
);

// Keep a sliver visible even at 0 so the orb never looks empty/broken.
const clampedFill = computed(() => Math.min(100, Math.max(6, props.fill)));
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/streak/_streak-orb.scss';
</style>
