<template>
    <div class="pomodoro-app">
        <layout-header />

        <main class="app-main">
            <PickList @open-settings="settingsOpen = true" />
            <TimerDisplay />
        </main>

        <footer class="app-footer">
            <p>Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js</p>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        </footer>

        <SettingsPanel :is-open="settingsOpen" @close="settingsOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useHead } from '#imports';
import { useTimerStore } from '~~/stores/timer';
import { useDocumentVisibility, usePageLeave } from '@vueuse/core';

const timerStore = useTimerStore();
const settingsOpen = ref(false);

// Dynamic page title with timer
const pageTitle = computed(() => {
    if (timerStore.isRunning || timerStore.isPaused) {
        return `${timerStore.formattedTime} - Pomodorider`;
    }
    return 'Pomodorider - Cozy Pomodoro Timer';
});

useHead({
    title: pageTitle,
    meta: [
        {
            name: 'description',
            content: 'A cozy Pomodoro timer built with Nuxt.js',
        },
    ],
});

// Use VueUse composables for enhanced functionality
const visibility = useDocumentVisibility();
const isLeavingPage = usePageLeave();

watch(visibility, (current) => {
    if (current === 'visible' && timerStore.isRunning) {
        // Timer continues running in the background
    }
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/breakpoints' as *;

.pomodoro-app {
    display: flex;
    flex-direction: column;

    .app-main {
        display: flex;
    }
}

.app-footer {
    font-size: 0.9rem;
    text-align: center;
    padding: $spacing-lg;
    color: $text-secondary;

    a {
        color: $text-secondary;
    }
}

@include respond-to(tablet) {
    .pomodoro-app .app-main {
        flex-direction: column;
    }

    .app-header {
        h1 {
            font-size: 2rem;
        }

        .subtitle {
            font-size: 1rem;
        }
    }
}
</style>
