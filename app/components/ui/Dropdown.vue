<template>
    <div ref="dropdownRef" class="dropdown">
        <button
            type="button"
            class="dropdown__toggle"
            :class="{ 'dropdown__toggle--open': openDropdown }"
            @click="openDropdown = !openDropdown"
        >
            <slot name="toggle" />
        </button>

        <transition name="dropdown">
            <ul
                v-if="openDropdown"
                class="dropdown-menu"
                @click="openDropdown = false"
            >
                <slot name="menu" />
            </ul>
        </transition>
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
@use '@@/app/assets/styles/components/ui/_dropdown.scss';
</style>
