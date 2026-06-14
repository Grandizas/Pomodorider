<template>
    <div class="settings-panel" v-if="isOpen">
        <div class="settings-overlay" @click="close"></div>
        <div class="settings-content">
            <div class="settings-header">
                <h2>Settings</h2>
                <ui-button variant="icon" @click="close">
                    <FontAwesomeIcon
                        :icon="['far', 'xmark']"
                        class="icon-regular"
                    />
                </ui-button>
            </div>

            <div class="settings-body">
                <div class="setting-group">
                    <h3>Timer Durations (minutes)</h3>

                    <!-- ----------------- [ Work duration ] ----------------- -->
                    <div class="setting-item">
                        <ui-input
                            id="work-duration"
                            v-model.number="localSettings.workDuration"
                            label="Work Duration"
                            type="number"
                            min="1"
                            max="60"
                            placeholder="25"
                            :leftIcon="['far', 'hourglass-clock']"
                        />
                    </div>

                    <!-- ----------------- [ Short break ] ----------------- -->
                    <div class="setting-item">
                        <ui-input
                            id="short-break"
                            v-model.number="localSettings.shortBreakDuration"
                            label="Short Break"
                            type="number"
                            min="1"
                            max="30"
                            placeholder="10"
                            :leftIcon="['far', 'person-meditating']"
                        />
                    </div>

                    <!-- ----------------- [ Long break ] ----------------- -->
                    <div class="setting-item">
                        <ui-input
                            id="long-break"
                            v-model.number="localSettings.longBreakDuration"
                            label="Long Break"
                            type="number"
                            min="1"
                            max="60"
                            placeholder="20"
                            :leftIcon="['far', 'wave']"
                        />
                    </div>

                    <!-- ----------------- [ Long break interval ] ----------------- -->
                    <div class="setting-item">
                        <ui-input
                            id="long-break-interval"
                            v-model.number="localSettings.longBreakInterval"
                            label="Long Break Interval"
                            type="number"
                            min="2"
                            max="10"
                            placeholder="4"
                            :leftIcon="['far', 'grid-round-2-plus']"
                        />

                        <span class="setting-hint"
                            >After how many work sessions</span
                        >
                    </div>
                </div>

                <!-- ----------------- [ Auto start ] ----------------- -->
                <div class="setting-group">
                    <h3>Auto Start</h3>

                    <div class="setting-item">
                        <ui-checkbox
                            id="auto-start-breaks"
                            v-model="localSettings.autoStartBreaks"
                            text="Auto-start breaks"
                        />
                    </div>

                    <div class="setting-item">
                        <ui-checkbox
                            id="auto-start-work"
                            v-model="localSettings.autoStartWork"
                            text="Auto-start work sessions"
                        />
                    </div>
                </div>

                <!-- ----------------- [ Display ] ----------------- -->
                <div class="setting-group">
                    <h3>Display</h3>

                    <div class="setting-item">
                        <ui-checkbox
                            id="keep-awake"
                            v-model="localSettings.keepAwake"
                            text="Keep screen awake while timer runs"
                        />
                        <span class="setting-hint"
                            >Stops the screen from sleeping while a session is
                            running. Only works while this tab is open.</span
                        >
                    </div>
                </div>

                <!-- ----------------- [ Sound ] ----------------- -->
                <div class="setting-group">
                    <h3>Sound</h3>

                    <div class="setting-item">
                        <ui-checkbox
                            id="sound-enabled"
                            v-model="localSettings.soundEnabled"
                            text="Enable sound notifications"
                        />
                    </div>

                    <!-- ----- * Set volume * ----- -->
                    <div
                        class="setting-item sound-volume"
                        v-if="localSettings.soundEnabled"
                    >
                        <label for="sound-volume">
                            Volume:
                            {{ Math.round(localSettings.soundVolume * 100) }}%
                        </label>
                        <ui-slider
                            id="sound-volume"
                            v-model="localSettings.soundVolume"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            aria-label="Volume"
                        />
                    </div>

                    <!-- ----- * Start sounds * ----- -->
                    <p>Start sound</p>
                    <ui-dropdown>
                        <template #toggle>
                            <span>{{ getSoundLabel('start') }}</span>
                            <FontAwesomeIcon
                                :icon="['far', 'chevron-down']"
                                class="icon-small"
                            />
                        </template>

                        <template #menu>
                            <li
                                v-for="(item, index) in startSounds"
                                :key="index"
                                class="dropdown-item"
                                @click="updateSound('start', item)"
                            >
                                {{ item.label }}
                            </li>
                        </template>
                    </ui-dropdown>

                    <!-- ----- * Pause sounds * ----- -->
                    <p>Pause sound</p>
                    <ui-dropdown>
                        <template #toggle>
                            <span>{{ getSoundLabel('pause') }}</span>
                            <FontAwesomeIcon
                                :icon="['far', 'chevron-down']"
                                class="icon-small"
                            />
                        </template>

                        <template #menu>
                            <li
                                v-for="(item, index) in pauseSounds"
                                :key="index"
                                class="dropdown-item"
                                @click="updateSound('pause', item)"
                            >
                                {{ item.label }}
                            </li>
                        </template>
                    </ui-dropdown>

                    <!-- ----- * Finish sounds * ----- -->
                    <p>Finish sound</p>
                    <ui-dropdown>
                        <template #toggle>
                            <span>{{ getSoundLabel('end') }}</span>
                            <FontAwesomeIcon
                                :icon="['far', 'chevron-down']"
                                class="icon-small"
                            />
                        </template>

                        <template #menu>
                            <li
                                v-for="(item, index) in finishSounds"
                                :key="index"
                                class="dropdown-item"
                                @click="updateSound('end', item)"
                            >
                                {{ item.label }}
                            </li>
                        </template>
                    </ui-dropdown>
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
import { useTimerStore } from '~~/stores/timer';
import { startSounds, pauseSounds, finishSounds } from '~~/constants/sounds';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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

const getSoundLabel = (type: 'start' | 'pause' | 'end') => {
    const value = localSettings.value.sounds[type];
    const fileName = value.split('/').pop();

    let options: any[] = [];
    if (type === 'start') options = startSounds;
    else if (type === 'pause') options = pauseSounds;
    else if (type === 'end') options = finishSounds;

    const option = options.find((o) => o.fileName === fileName);
    return option ? option.label : 'Select sound';
};

const updateSound = (type: 'start' | 'pause' | 'end', item: any) => {
    const path = `/sounds/${item.fileName}`;
    localSettings.value.sounds[type] = path;

    // Preview sound
    timerStore.playSound(type, path);
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
