<template>
  <div class="pomodoro-app">
    <header class="app-header">
      <h1>🍅 Pomodorider</h1>
      <p class="subtitle">Your cozy Pomodoro companion</p>
      <button class="settings-button" @click="settingsOpen = true" title="Settings">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      </button>
    </header>

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
import { ref, computed, watch } from 'vue'
import { useHead, useTitle } from '#imports'
import { useTimerStore } from '~/stores/timer'
import { useDocumentVisibility, usePageLeave } from '@vueuse/core'

const timerStore = useTimerStore()
const settingsOpen = ref(false)

// Dynamic page title with timer
const pageTitle = computed(() => {
  if (timerStore.isRunning || timerStore.isPaused) {
    return `${timerStore.formattedTime} - Pomodorider`
  }
  return 'Pomodorider - Cozy Pomodoro Timer'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: 'A cozy Pomodoro timer built with Nuxt.js' }
  ]
})

// Use VueUse composables for enhanced functionality
const visibility = useDocumentVisibility()
const isLeavingPage = usePageLeave()

// Keep timer accurate even when tab is not visible
watch(visibility, (current) => {
  if (current === 'visible' && timerStore.isRunning) {
    // Timer continues running in background
    console.log('Tab is visible again')
  }
})
</script>

<style scoped lang="scss">
.pomodoro-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: $spacing-xl $spacing-md $spacing-md;
  position: relative;

  h1 {
    font-size: 3rem;
    margin-bottom: $spacing-xs;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: $text-secondary;
    font-size: 1.1rem;
  }
}

.settings-button {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  background: $surface-color;
  color: $text-color;
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;

  &:hover {
    background: color-mix(in srgb, $surface-color 95%, white);
    box-shadow: $shadow-md;
  }

  svg {
    display: block;
  }
}

.app-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
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

  .settings-button {
    top: $spacing-md;
    right: $spacing-md;
  }
}
</style>
