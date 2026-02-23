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
    transition: transform 0.2s ease-in-out;

    &:not(&.secondary-btn) {
        color: rgb(var(--color-buttonText));
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
        color: var(--color-text);
        padding: spacing(1) spacing(2);
        border-radius: $border-radius-sm;
        background-color: $background-color;
    }
}

.primary-btn {
    border-radius: 5rem;
    padding: spacing(1) spacing(3);
    background-color: $button-background-color;
}

.icon-btn {
    display: flex;
    width: rem(40px);
    height: rem(40px);
    border-radius: 50%;
    padding: spacing(1);
    align-items: center;
    justify-content: center;
    background-color: $background-color;
}
</style>
