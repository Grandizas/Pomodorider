<template>
    <div ref="dropdownRef" class="dropdown">
        <button
            type="button"
            class="dropdown__toggle"
            @click="openDropdown = !openDropdown"
        >
            <slot name="toggle" />
        </button>
        <ul v-if="openDropdown" class="dropdown-menu">
            <slot name="menu" />
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const openDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

onClickOutside(dropdownRef, () => {
    openDropdown.value = false;
});
</script>

<style scoped lang="scss">
.dropdown {
    position: relative;
    margin: spacing(2) 0;

    &__toggle {
        cursor: pointer;
        color: rgb(var(--color-text));
        background-color: transparent;
        padding: spacing(1) spacing(2);
        border-radius: $border-radius-sm;
        border: 2px solid $button-background-color;
    }

    &-menu {
        right: 0;
        z-index: 1000;
        min-width: 100%;
        list-style: none;
        position: absolute;
        width: max-content;
        padding: spacing(1);
        max-width: rem(300px);
        border-radius: $border-radius-sm;
        background-color: $button-background-color;
    }
}
</style>
