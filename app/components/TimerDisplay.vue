<template>
    <div class="timer-display" :class="`timer-${timerStore.mode} ${timerView}`">
        <ui-dropdown
            class="timer-display__changer"
            :items="['large', 'minimal']"
            @selected="(size: string) => (timerView = size)"
        >
            Timer size: {{ timerView }}
        </ui-dropdown>

        <div class="timer-display__header">
            <ui-svg-logo width="32" height="32" />
            <h1>Pomodorider</h1>
        </div>

        <div :class="`timer-display__inner ${timerView}`">
            <!-- ----------------- [ Switch buttons (Work, Break) ] ----------------- -->
            <!--            <div v-if="timerView === 'large'" class="timer-mode">-->
            <!--                <button-->
            <!--                    v-for="mode in modes"-->
            <!--                    :key="mode.value"-->
            <!--                    :class="[-->
            <!--                        'mode-button',-->
            <!--                        { active: timerStore.mode === mode.value },-->
            <!--                    ]"-->
            <!--                    @click="switchMode(mode.value)"-->
            <!--                >-->
            <!--                    {{ mode.label }}-->
            <!--                </button>-->
            <!--            </div>-->

            <!-- ----------------- [ Timer ] ----------------- -->
            <parts-timer :class="timerView" />
            <!-- ----------------- [ Controls ] ----------------- -->
            <parts-timer-controls :class="timerView" />

            <!-- ----------------- [ Sessions, Total time ] ----------------- -->
            <div class="timer-stats">
                <div class="stat">
                    <div class="stat-value">
                        {{ timerStore.sessionsCompleted }}
                    </div>
                    <div class="stat-label">Sessions</div>
                </div>

                <div class="stat">
                    <div class="stat-value">{{ formattedWorkTime }}</div>
                    <div class="stat-label">Total Time</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimerStore, type TimerMode } from '~~/stores/timer';
import { Icon } from '@iconify/vue';

const timerStore = useTimerStore();

const timerView = ref<string>('large');
const modes = [
    { value: 'work' as TimerMode, label: 'Work' },
    { value: 'shortBreak' as TimerMode, label: 'Short Break' },
    { value: 'longBreak' as TimerMode, label: 'Long Break' },
];

const formattedWorkTime = computed(() => {
    const hours = Math.floor(timerStore.totalWorkTime / 3600);
    const minutes = Math.floor((timerStore.totalWorkTime % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
});

const switchMode = (mode: TimerMode) => {
    if (!timerStore.isRunning) {
        timerStore.switchMode(mode);
    }
};
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/_timer-display.scss';
</style>
