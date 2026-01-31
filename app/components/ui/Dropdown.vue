<template>
    <div ref="dropdownRef" class="dropdown">
        <ui-button
            class="dropdown__toggle"
            variant="secondary"
            @click="openDropdown = !openDropdown"
        >
            <slot />
        </ui-button>
        <ul v-if="openDropdown" class="dropdown-menu">
            <li
                v-for="(item, index) in items"
                :key="index"
                class="dropdown-item"
                @click="emit('selected', item)"
            >
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

defineProps<{
    items: string[];
}>();

const emit = defineEmits<{
    (e: 'selected', item: string): void;
}>();

const openDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

onClickOutside(dropdownRef, () => {
    openDropdown.value = false;
});
</script>

<style scoped lang="scss">
.dropdown {
    &-menu {
        right: 0;
        z-index: 1000;
        min-width: 100%;
        list-style: none;
        position: absolute;
        width: max-content;
        max-width: rem(300px);
        border-radius: $border-radius-sm;
        background-color: rgba(0, 0, 0, 0.4);

        li {
            cursor: pointer;
            padding: spacing(2);
            text-transform: capitalize;

            &:hover {
                background-color: var(--color-accent);
            }
        }
    }
}
</style>
