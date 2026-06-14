<template>
    <aside class="pick-list">
        <!-- ----------------- [ Themes ] ----------------- -->
        <parts-pick-list-theme-list />

        <!-- ----------------- [ Settings ] ----------------- -->
        <ui-button
            variant="icon"
            title="Settings"
            aria-label="Settings"
            @click="emit('open-settings')"
        >
            <FontAwesomeIcon
                :icon="['far', 'gear-complex']"
                class="icon-regular"
            />
        </ui-button>

        <!-- ----------------- [ Achievements ] ----------------- -->
        <ui-button
            v-if="user"
            variant="icon"
            title="Achievements"
            aria-label="Achievements"
            @click="emit('open-achievements')"
        >
            <FontAwesomeIcon
                :icon="['far', 'trophy-star']"
                class="icon-regular"
            />
        </ui-button>

        <!-- ----------------- [ Mute ] ----------------- -->
        <ui-button
            variant="icon"
            title="Mute"
            aria-label="Mute"
            @click="onMute()"
        >
            <FontAwesomeIcon
                :icon="[
                    'far',
                    timerStore.settings.soundEnabled
                        ? 'volume-high'
                        : 'volume-xmark',
                ]"
                class="icon-regular"
            />
        </ui-button>
    </aside>
</template>

<script setup lang="ts">
import { useTimerStore } from '~~/stores/timer';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const timerStore = useTimerStore();
const user = useSupabaseUser();

const emit = defineEmits<{
    (e: 'open-settings'): void;
    (e: 'open-achievements'): void;
}>();

function onMute() {
    timerStore.updateSettings({
        soundEnabled: !timerStore.settings.soundEnabled,
    });
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/breakpoints' as *;

.pick-list {
    z-index: 2;
    display: flex;
    gap: spacing(2);
    position: relative;
    align-items: center;
    padding: spacing(2);
    width: $picker-width;
    flex-direction: column;
    justify-content: center;

    @include respond-to(tablet) {
        width: 100%;
        flex-direction: row;
        margin-top: spacing(6);
    }
}
</style>
