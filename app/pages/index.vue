<template>
    <div class="pomodoro-app">
        <layout-header
            @open-settings="settingsOpen = true"
            @fullscreen="isFullscreen = !isFullscreen"
        />

        <main class="app-main">
            <TimerDisplay />
        </main>

        <footer class="app-footer">
            <p>Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js</p>
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
const isFullscreen = ref(false);

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
        console.log('Tab is visible again');
    }
});
</script>

<style scoped lang="scss">
.pomodoro-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-footer {
    text-align: center;
    padding: $spacing-lg;
    color: $text-secondary;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
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
