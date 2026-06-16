<template>
    <div class="logo-text">
        <ui-svg-logo width="32" height="32" />
        <span class="logo-text__name">Pomodorider</span>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.logo-text {
    opacity: 0.8;
    display: flex;
    gap: spacing(2);
    align-items: center;
    justify-content: center;

    &__name {
        font-size: 1.5rem;
        font-weight: 700;
        color: $text-color;
    }
}
</style>
