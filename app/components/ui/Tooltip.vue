<template>
    <div
        ref="rootRef"
        class="tooltip"
        @mouseenter="open"
        @mouseleave="close"
    >
        <button
            type="button"
            class="tooltip__trigger"
            :class="{ 'tooltip__trigger--open': isOpen }"
            :aria-expanded="isOpen"
            :aria-label="ariaLabel"
            @click="toggle"
            @focus="open"
            @blur="close"
        >
            <slot name="trigger">
                <span class="tooltip__icon" aria-hidden="true">i</span>
            </slot>
        </button>

        <transition name="tooltip">
            <div
                v-if="isOpen"
                class="tooltip__bubble"
                :class="`tooltip__bubble--${placement}`"
                role="tooltip"
            >
                <slot />
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

withDefaults(
    defineProps<{
        placement?: 'bottom' | 'top';
        ariaLabel?: string;
    }>(),
    {
        placement: 'bottom',
        ariaLabel: 'More info',
    },
);

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

function open() {
    isOpen.value = true;
}
function close() {
    isOpen.value = false;
}
function toggle() {
    isOpen.value = !isOpen.value;
}

onClickOutside(rootRef, close);
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_tooltip.scss';
</style>
