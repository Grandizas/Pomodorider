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
    color: var(--color-buttonText);
    background: linear-gradient(
        to right,
        var(--color-logoGradientStart),
        var(--color-logoGradientEnd)
    );

    &:hover {
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
    }
}

.primary-btn {
    border-radius: 5rem;
    padding: spacing(1) spacing(3);
}

.icon-btn {
    display: flex;
    border-radius: 50%;
    padding: spacing(1);
    align-items: center;
    justify-content: center;
}
</style>
