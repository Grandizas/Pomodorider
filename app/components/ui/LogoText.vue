<template>
    <div class="logo-text">
        <ui-svg-logo width="32" height="32" />
        <h1>Pomodorider</h1>
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

    h1 {
        color: $text-color;
    }
}
</style>
