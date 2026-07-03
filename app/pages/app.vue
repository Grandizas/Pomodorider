<template>
    <div class="pomodoro-app">
        <layout-header />

        <main class="app-main">
            <PickList
                @open-settings="settingsOpen = true"
                @open-achievements="achievementsOpen = true"
            />
            <TimerDisplay />
        </main>

        <footer class="app-footer">
            <p>Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js</p>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        </footer>

        <SettingsPanel :is-open="settingsOpen" @close="settingsOpen = false" />
        <parts-achievements-modal
            :is-open="achievementsOpen"
            @close="achievementsOpen = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead, useSeoMeta } from '#imports';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();
const settingsOpen = ref(false);
const achievementsOpen = ref(false);

// While a session runs, the countdown takes over the browser-tab title; idle
// falls back to a plain app title. (The keyword-rich SEO title lives on `/`.)
const pageTitle = computed(() => {
    if (timerStore.isRunning || timerStore.isPaused) {
        return `${timerStore.formattedTime} - Pomodorider`;
    }
    return 'Pomodoro Timer — Pomodorider';
});

useHead({
    title: pageTitle,
    htmlAttrs: { lang: 'en' },
});

useSeoMeta({
    description:
        'Your Pomodoro timer — cozy themes, ambient sounds, custom sounds, focus streaks, and analytics. No signup required.',
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
}
</style>
