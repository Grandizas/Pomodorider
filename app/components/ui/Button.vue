<template>
    <button :class="`${variant}-btn btn`" type="button">
        <slot />
    </button>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        variant?: 'primary' | 'secondary' | 'icon';
    }>(),
    {
        variant: 'primary',
    },
);
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/_functions.scss' as *;

.btn {
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s ease-in-out;

    &:not(&.secondary-btn) {
        color: var(--color-buttonText);
        background-color: $background-color;
        transition:
            background-color 0.2s ease-in-out,
            transform 0.2s ease-in-out;

        &:hover {
            background-color: $button-background-color;
        }
    }

    &:hover {
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
    }

    &.secondary-btn {
        padding: spacing(1) spacing(2);
        border-radius: $border-radius-sm;
        background-color: var(--color-accent);
        color: var(--color-text);
    }
}

.primary-btn {
    border-radius: 5rem;
    padding: spacing(1) spacing(3);
}

.icon-btn {
    display: flex;
    width: rem(40px);
    height: rem(40px);
    border-radius: 50%;
    padding: spacing(1);
    align-items: center;
    justify-content: center;
}
</style>
