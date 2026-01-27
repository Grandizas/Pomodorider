<template>
    <header class="app-header">
        <!-- ----------------- [ Header left ] ----------------- -->
        <div class="app-header__left">
            <h1>Pomodorider</h1>
            <p class="subtitle">Your cozy Pomodoro companion</p>
        </div>

        <!-- ----------------- [ Header right ] ----------------- -->
        <div class="app-header__right">
            <ui-theme-picker />

            <ui-button
                variant="icon"
                title="Settings"
                @click="emit('open-settings')"
            >
                <Icon icon="heroicons:cog-6-tooth" width="24" />
            </ui-button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const emit = defineEmits<{
    (e: 'open-settings'): void;
}>();
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/_functions.scss' as *;

.app-header {
    display: flex;
    position: relative;
    justify-content: space-between;
    padding: spacing(2) $spacing-page;

    h1 {
        font-size: 1.6rem;
        font-weight: 700;

        background: linear-gradient(
            to right,
            var(--color-logoGradientStart),
            var(--color-logoGradientEnd)
        );

        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    p {
        font-size: 0.7rem;
    }

    &__right {
        display: flex;
        gap: spacing(1);
        align-items: center;
    }
}
</style>
