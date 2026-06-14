<template>
    <div class="timer-controls">
        <!-- ----------------- [ Reset ] ----------------- -->
        <button
            class="control-button secondary"
            @click="timerStore.reset()"
            :disabled="
                timerStore.timeRemaining ===
                timerStore.getDuration(timerStore.mode) * 60
            "
        >
            <FontAwesomeIcon
                :icon="['far', 'arrow-rotate-left']"
                class="icon-regular"
            />
        </button>

        <!-- ----------------- [ Play ] ----------------- -->
        <button
            v-if="!timerStore.isRunning && !timerStore.isPaused"
            class="control-button start"
            @click="timerStore.start()"
        >
            <FontAwesomeIcon :icon="['far', 'play']" class="icon-regular" />
        </button>

        <!-- ----------------- [ Pause ] ----------------- -->
        <button
            v-if="timerStore.isRunning"
            class="control-button pause"
            @click="timerStore.pause()"
        >
            <FontAwesomeIcon :icon="['far', 'pause']" class="icon-regular" />
        </button>

        <!-- ----------------- [ Resume / Play ] ----------------- -->
        <button
            v-if="timerStore.isPaused"
            class="control-button resume"
            @click="timerStore.resume()"
        >
            <FontAwesomeIcon :icon="['far', 'play']" class="icon-regular" />
        </button>

        <!-- ----------------- [ Skip ] ----------------- -->
        <button class="control-button secondary" @click="timerStore.skip()">
            <FontAwesomeIcon :icon="['far', 'forward']" class="icon-regular" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useTimerStore } from '~~/stores/timer';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const timerStore = useTimerStore();
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_controls.scss';
</style>
