<template>
    <div class="settings-panel" v-if="isOpen">
        <div class="settings-overlay" @click="close"></div>
        <div class="settings-content">
            <div class="settings-header">
                <h2>Settings</h2>
                <ui-button variant="icon" @click="close">
                    <Icon icon="heroicons:x-mark" width="24" />
                </ui-button>
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
                        <label for="long-break-interval"
                            >Long Break Interval</label
                        >
                        <input
                            id="long-break-interval"
                            type="number"
                            min="2"
                            max="10"
                            v-model.number="localSettings.longBreakInterval"
                        />
                        <span class="setting-hint"
                            >After how many work sessions</span
                        >
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
                        <span class="volume-value"
                            >{{
                                Math.round(localSettings.soundVolume * 100)
                            }}%</span
                        >
                    </div>

                    <div class="setting-item" v-if="localSettings.soundEnabled">
                        <ui-button @click="testSound">Test Sound</ui-button>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>Statistics</h3>
                    <ui-button @click="resetStats">Reset Statistics</ui-button>
                </div>
            </div>

            <div class="settings-footer">
                <button class="save-button" @click="save">
                    <span>Save Settings</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useTimerStore } from '~~/stores/timer';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();

const timerStore = useTimerStore();

const localSettings = ref({ ...timerStore.settings });

watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) {
            localSettings.value = { ...timerStore.settings };
        }
    },
);

const close = () => {
    emit('close');
};

const save = () => {
    timerStore.updateSettings(localSettings.value);
    close();
};

const testSound = () => {
    timerStore.initSound();
    timerStore.notificationSound?.play();
};

const resetStats = () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
        timerStore.resetStats();
    }
};
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/_settings-modal.scss';
</style>
