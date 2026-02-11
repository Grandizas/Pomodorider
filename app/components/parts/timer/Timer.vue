<template>
    <div class="timer-orb__wrapper">
        <div class="timer-orb__light" />

        <div class="timer-orb" style="--fill-pct: 28%">
            <div class="timer-orb__bg" />
            <div class="timer-orb__liquid" aria-hidden="true"></div>
            <div class="timer-orb__time">{{ timerStore.formattedTime }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_timer.scss';
</style>
