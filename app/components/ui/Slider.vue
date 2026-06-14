<template>
    <div class="slider" :style="{ '--p': percent }">
        <input
            :id="id"
            v-model.number="modelValue"
            class="slider__input"
            type="range"
            :min="min"
            :max="max"
            :step="step"
            :aria-label="ariaLabel"
        />

        <div class="slider__track">
            <div class="slider__fill"></div>
        </div>

        <span class="slider__origin"></span>
        <span class="slider__thumb"></span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        id?: string;
        min?: number;
        max?: number;
        step?: number;
        ariaLabel?: string;
    }>(),
    {
        min: 0,
        max: 100,
        step: 1,
    },
);

const modelValue = defineModel<number>({ required: true });

const percent = computed(() => {
    const range = props.max - props.min;
    if (!range) return 0;

    const clamped = Math.min(props.max, Math.max(props.min, modelValue.value));
    return ((clamped - props.min) / range) * 100;
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_slider.scss';
</style>
