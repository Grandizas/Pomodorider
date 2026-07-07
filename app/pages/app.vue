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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useHead, useSeoMeta } from '#imports';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();
const settingsOpen = ref(false);
const achievementsOpen = ref(false);

// Keyboard shortcuts, advertised on the landing page and in the README:
//   Space — start / pause / resume     R — reset     S — skip
function onKeydown(event: KeyboardEvent) {
    const isSpace = event.code === 'Space' || event.key === ' ';
    const key = event.key.toLowerCase();
    if (!isSpace && key !== 'r' && key !== 's') return;

    // Don't hijack keys while typing, when a modal is open, or when they're
    // meant to activate a focused control (button/checkbox/link).
    if (settingsOpen.value || achievementsOpen.value) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target as HTMLElement | null;
    if (target) {
        const tag = target.tagName;
        if (
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT' ||
            tag === 'BUTTON' ||
            tag === 'A' ||
            target.isContentEditable
        ) {
            return;
        }
    }

    // Space would otherwise scroll the page; the others are safe to consume.
    event.preventDefault();

    if (isSpace) {
        if (timerStore.isRunning) {
            timerStore.pause();
        } else if (timerStore.isPaused) {
            timerStore.resume();
        } else {
            timerStore.start();
        }
    } else if (key === 'r') {
        timerStore.reset();
    } else if (key === 's') {
        timerStore.skip();
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
});

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
