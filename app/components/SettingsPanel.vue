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

                <!-- ----------------- [ Notifications ] ----------------- -->
                <div class="setting-group">
                    <h3>Notifications</h3>

                    <div class="setting-item">
                        <ui-checkbox
                            id="notifications-enabled"
                            v-model="localSettings.notificationsEnabled"
                            :disabled="notificationsBlocked"
                            text="Notify me when a session ends"
                        />
                        <span class="setting-hint">{{ notificationHint }}</span>
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

                    <!-- --- * Sound pickers (start / pause / resume / finish) * --- -->
                    <template v-for="slot in soundSlots" :key="slot.type">
                        <p>{{ slot.label }}</p>
                        <ui-dropdown>
                            <template #toggle>
                                <span>{{ getSoundLabel(slot.type) }}</span>
                                <FontAwesomeIcon
                                    :icon="['far', 'chevron-down']"
                                    class="icon-small"
                                />
                            </template>

                            <template #menu>
                                <li
                                    v-for="(item, index) in slot.options"
                                    :key="'builtin-' + index"
                                    class="dropdown-item"
                                    @click="updateSound(slot.type, item)"
                                >
                                    {{ item.label }}
                                </li>

                                <li
                                    v-if="localSettings.customSounds.length"
                                    class="dropdown-divider"
                                    role="separator"
                                ></li>

                                <li
                                    v-for="sound in localSettings.customSounds"
                                    :key="sound.id"
                                    class="dropdown-item dropdown-item--custom"
                                    @click="selectCustom(slot.type, sound)"
                                >
                                    <span class="dropdown-item__label">{{
                                        sound.label
                                    }}</span>
                                    <button
                                        type="button"
                                        class="dropdown-item__remove"
                                        title="Remove sound"
                                        aria-label="Remove sound"
                                        @click.stop="removeCustom(sound.id)"
                                    >
                                        <FontAwesomeIcon
                                            :icon="['far', 'xmark']"
                                        />
                                    </button>
                                </li>

                                <li
                                    class="dropdown-item dropdown-item--upload"
                                    @click="triggerUpload(slot.type)"
                                >
                                    <FontAwesomeIcon
                                        :icon="['far', 'arrow-up-from-bracket']"
                                        class="icon-small"
                                    />
                                    Upload custom sound
                                </li>
                            </template>
                        </ui-dropdown>
                    </template>

                    <!-- Shared hidden input; the slot to fill is tracked in JS. -->
                    <input
                        ref="fileInput"
                        type="file"
                        accept="audio/*"
                        class="sound-file-input"
                        @change="onFileSelected"
                    />

                    <p v-if="uploadError" class="sound-upload-error">
                        {{ uploadError }}
                    </p>
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
import { ref, computed, watch } from 'vue';
import {
    useTimerStore,
    type TimerSettings,
    type CustomSound,
} from '~~/stores/timer';
import { useNotifications } from '~/composables/useNotifications';
import {
    startSounds,
    pauseSounds,
    resumeSounds,
    finishSounds,
    MAX_CUSTOM_SOUNDS,
    MAX_CUSTOM_SOUND_BYTES,
    type SoundOption,
} from '~~/constants/sounds';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

type SoundSlot = 'start' | 'pause' | 'resume' | 'end';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();

const timerStore = useTimerStore();

// A deep-enough draft of the store settings: the nested `sounds` and
// `customSounds` are cloned so edits (incl. uploads) stay local until "Save".
function cloneSettings(): TimerSettings {
    return {
        ...timerStore.settings,
        sounds: { ...timerStore.settings.sounds },
        customSounds: timerStore.settings.customSounds.map((c) => ({ ...c })),
    };
}

const localSettings = ref<TimerSettings>(cloneSettings());

const {
    supported: notificationsSupported,
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
} = useNotifications();

// The checkbox is disabled when notifications can't work at all (unsupported or
// blocked by the browser), so the only way to switch it on is from a usable
// 'default'/'granted' state.
const notificationsBlocked = computed(
    () => !notificationsSupported || notificationPermission.value === 'denied',
);

// Turning the toggle on prompts for browser permission on the spot (this runs
// from the checkbox click, a valid user gesture). If the user dismisses or
// blocks the prompt, flip the toggle back so the setting can never claim to be
// on while notifications can't actually fire.
watch(
    () => localSettings.value.notificationsEnabled,
    async (enabled) => {
        if (!enabled || notificationPermission.value === 'granted') return;
        const result = await requestNotificationPermission();
        if (result !== 'granted') {
            localSettings.value.notificationsEnabled = false;
        }
    },
);

const notificationHint = computed(() => {
    if (!notificationsSupported) {
        return 'Your browser does not support notifications.';
    }
    if (notificationPermission.value === 'denied') {
        return 'Notifications are blocked — re-enable them in your browser site settings.';
    }
    return 'Get a desktop alert when a session ends while this tab is in the background.';
});

watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) {
            localSettings.value = cloneSettings();
            uploadError.value = '';
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

// The sound pickers, driven by one loop in the template.
const soundSlots = [
    { type: 'start', label: 'Start sound', options: startSounds },
    { type: 'pause', label: 'Pause sound', options: pauseSounds },
    { type: 'resume', label: 'Resume sound', options: resumeSounds },
    { type: 'end', label: 'Finish sound', options: finishSounds },
] as const;

// Built-in fallback per slot when a referenced custom sound is removed. Mirrors
// the store's default `settings.sounds`.
const DEFAULT_SLOT_SOUND: Record<SoundSlot, string> = {
    start: '/sounds/start/start_glass_1.wav',
    pause: '/sounds/pause/pause_glass_1.wav',
    resume: '/sounds/resume/resume_glass_1.wav',
    end: '/sounds/finish/finish_glass_1.wav',
};

const fileInput = ref<HTMLInputElement | null>(null);
const pendingSlot = ref<SoundSlot>('start');
const uploadError = ref('');

const getSoundLabel = (type: SoundSlot) => {
    const value = localSettings.value.sounds[type];

    if (value.startsWith('custom:')) {
        const id = value.slice('custom:'.length);
        const found = localSettings.value.customSounds.find(
            (c) => c.id === id,
        );
        return found ? found.label : 'Select sound';
    }

    let options: SoundOption[] = [];
    if (type === 'start') options = startSounds;
    else if (type === 'pause') options = pauseSounds;
    else if (type === 'resume') options = resumeSounds;
    else if (type === 'end') options = finishSounds;

    const option = options.find((o) => `/sounds/${o.fileName}` === value);
    return option ? option.label : 'Select sound';
};

const updateSound = (type: SoundSlot, item: SoundOption) => {
    const path = `/sounds/${item.fileName}`;
    localSettings.value.sounds[type] = path;

    // Preview sound
    timerStore.playSound(type, path);
};

/** Point a slot at an existing custom sound and preview it. */
const selectCustom = (type: SoundSlot, sound: CustomSound) => {
    localSettings.value.sounds[type] = `custom:${sound.id}`;
    timerStore.playSound(type, sound.data);
};

const triggerUpload = (type: SoundSlot) => {
    pendingSlot.value = type;
    uploadError.value = '';
    fileInput.value?.click();
};

const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

/** File name without its extension, trimmed to a sane label length. */
const fileLabel = (name: string) => {
    const base = name.replace(/\.[^.]+$/, '').trim() || 'Custom sound';
    return base.length > 40 ? `${base.slice(0, 40)}…` : base;
};

const onFileSelected = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // let the same file be re-picked later
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
        uploadError.value = 'Please choose an audio file.';
        return;
    }
    if (file.size > MAX_CUSTOM_SOUND_BYTES) {
        const kb = Math.round(MAX_CUSTOM_SOUND_BYTES / 1024);
        uploadError.value = `That file is too large (max ${kb} KB).`;
        return;
    }
    if (localSettings.value.customSounds.length >= MAX_CUSTOM_SOUNDS) {
        uploadError.value = `You can keep up to ${MAX_CUSTOM_SOUNDS} custom sounds — remove one first.`;
        return;
    }

    let data: string;
    try {
        data = await readAsDataURL(file);
    } catch {
        uploadError.value = 'Could not read that file. Try another.';
        return;
    }
    if (!data.startsWith('data:audio/')) {
        uploadError.value = 'That file is not a supported audio format.';
        return;
    }

    const id =
        globalThis.crypto?.randomUUID?.() ??
        `cs_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const slot = pendingSlot.value;
    localSettings.value.customSounds.push({ id, label: fileLabel(file.name), data });
    localSettings.value.sounds[slot] = `custom:${id}`;
    uploadError.value = '';

    timerStore.playSound(slot, data); // preview
};

/** Delete a custom sound and reset any slot that was using it. */
const removeCustom = (id: string) => {
    localSettings.value.customSounds = localSettings.value.customSounds.filter(
        (c) => c.id !== id,
    );
    const ref = `custom:${id}`;
    (['start', 'pause', 'resume', 'end'] as SoundSlot[]).forEach((slot) => {
        if (localSettings.value.sounds[slot] === ref) {
            localSettings.value.sounds[slot] = DEFAULT_SLOT_SOUND[slot];
        }
    });
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
