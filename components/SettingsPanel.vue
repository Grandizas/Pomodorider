<template>
  <div class="settings-panel" v-if="isOpen">
    <div class="settings-overlay" @click="close"></div>
    <div class="settings-content">
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="close-button" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div class="settings-body">
        <div class="setting-group">
          <h3>Timer Durations (minutes)</h3>
          
          <div class="setting-item">
            <label for="work-duration">Work Duration</label>
            <input
              id="work-duration"
              type="number"
              min="1"
              max="60"
              v-model.number="localSettings.workDuration"
            />
          </div>

          <div class="setting-item">
            <label for="short-break">Short Break</label>
            <input
              id="short-break"
              type="number"
              min="1"
              max="30"
              v-model.number="localSettings.shortBreakDuration"
            />
          </div>

          <div class="setting-item">
            <label for="long-break">Long Break</label>
            <input
              id="long-break"
              type="number"
              min="1"
              max="60"
              v-model.number="localSettings.longBreakDuration"
            />
          </div>

          <div class="setting-item">
            <label for="long-break-interval">Long Break Interval</label>
            <input
              id="long-break-interval"
              type="number"
              min="2"
              max="10"
              v-model.number="localSettings.longBreakInterval"
            />
            <span class="setting-hint">After how many work sessions</span>
          </div>
        </div>

        <div class="setting-group">
          <h3>Auto Start</h3>
          
          <div class="setting-item">
            <label for="auto-start-breaks">
              <input
                id="auto-start-breaks"
                type="checkbox"
                v-model="localSettings.autoStartBreaks"
              />
              Auto-start breaks
            </label>
          </div>

          <div class="setting-item">
            <label for="auto-start-work">
              <input
                id="auto-start-work"
                type="checkbox"
                v-model="localSettings.autoStartWork"
              />
              Auto-start work sessions
            </label>
          </div>
        </div>

        <div class="setting-group">
          <h3>Sound</h3>
          
          <div class="setting-item">
            <label for="sound-enabled">
              <input
                id="sound-enabled"
                type="checkbox"
                v-model="localSettings.soundEnabled"
              />
              Enable sound notifications
            </label>
          </div>

          <div class="setting-item" v-if="localSettings.soundEnabled">
            <label for="sound-volume">Volume</label>
            <input
              id="sound-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model.number="localSettings.soundVolume"
            />
            <span class="volume-value">{{ Math.round(localSettings.soundVolume * 100) }}%</span>
          </div>

          <div class="setting-item" v-if="localSettings.soundEnabled">
            <button class="test-sound-button" @click="testSound">
              Test Sound
            </button>
          </div>
        </div>

        <div class="setting-group">
          <h3>Statistics</h3>
          <button class="reset-button" @click="resetStats">
            Reset Statistics
          </button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="save-button" @click="save">Save Settings</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTimerStore } from '~/stores/timer'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const timerStore = useTimerStore()

const localSettings = ref({ ...timerStore.settings })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localSettings.value = { ...timerStore.settings }
  }
})

const close = () => {
  emit('close')
}

const save = () => {
  timerStore.updateSettings(localSettings.value)
  close()
}

const testSound = () => {
  timerStore.initSound()
  timerStore.notificationSound?.play()
}

const resetStats = () => {
  if (confirm('Are you sure you want to reset all statistics?')) {
    timerStore.resetStats()
  }
}
</script>

<style scoped lang="scss">
.settings-panel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.settings-content {
  position: relative;
  background: $surface-color;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: $shadow-lg;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
}

.close-button {
  background: transparent;
  color: $text-color;
  padding: $spacing-xs;
  border-radius: $border-radius-sm;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.settings-body {
  padding: $spacing-lg;
  overflow-y: auto;
  flex: 1;
}

.setting-group {
  margin-bottom: $spacing-xl;

  h3 {
    font-size: 1.1rem;
    margin-bottom: $spacing-md;
    color: $text-color;
  }
}

.setting-item {
  margin-bottom: $spacing-md;

  label {
    display: block;
    margin-bottom: $spacing-xs;
    color: $text-secondary;
    font-size: 0.9rem;
  }

  input[type="number"],
  input[type="range"] {
    width: 100%;
    padding: $spacing-sm;
    background: $background-color;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: $border-radius-sm;
    color: $text-color;
    font-size: 1rem;
  }

  input[type="checkbox"] {
    margin-right: $spacing-xs;
    width: auto;
  }

  input[type="range"] {
    padding: 0;
  }
}

.setting-hint {
  display: block;
  font-size: 0.8rem;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.volume-value {
  display: inline-block;
  margin-left: $spacing-sm;
  color: $text-color;
  font-weight: 600;
}

.test-sound-button,
.reset-button {
  background: $surface-color;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-color;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  font-size: 0.9rem;

  &:hover {
    background: lighten($surface-color, 5%);
  }
}

.settings-footer {
  padding: $spacing-lg;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-button {
  width: 100%;
  background: $primary-color;
  color: white;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: $shadow-md;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-content {
    width: 95%;
    max-height: 95vh;
  }

  .settings-header,
  .settings-body,
  .settings-footer {
    padding: $spacing-md;
  }
}
</style>
