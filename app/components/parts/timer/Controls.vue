<template>
    <div class="timer-controls">
        <!-- ----------------- [ Play ] ----------------- -->
        <button
            v-if="!timerStore.isRunning && !timerStore.isPaused"
            class="control-button start"
            @click="timerStore.start()"
        >
            <Icon icon="mdi:play" width="24" />
        </button>

        <!-- ----------------- [ Pause ] ----------------- -->
        <button
            v-if="timerStore.isRunning"
            class="control-button pause"
            @click="timerStore.pause()"
        >
            <Icon icon="heroicons:pause-solid" width="24" />
        </button>

        <!-- ----------------- [ Resume / Play ] ----------------- -->
        <button
            v-if="timerStore.isPaused"
            class="control-button resume"
            @click="timerStore.resume()"
        >
            <Icon icon="mdi:play" width="24" />
        </button>

        <!-- ----------------- [ Reset ] ----------------- -->
        <button
            class="control-button secondary"
            @click="timerStore.reset()"
            :disabled="
                timerStore.timeRemaining ===
                timerStore.getDuration(timerStore.mode) * 60
            "
        >
            <Icon icon="ri:reset-left-fill" width="24" />
        </button>

        <!-- ----------------- [ Skip ] ----------------- -->
        <button class="control-button secondary" @click="timerStore.skip()">
            <Icon icon="ix:skip-filled" width="24" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_controls.scss';
</style>
