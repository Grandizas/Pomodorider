<template>
    <div class="timer-time">
        {{ timerStore.formattedTime }}
    </div>
</template>

<script setup lang="ts">
import { useTimerStore } from '~~/stores/timer';

const timerStore = useTimerStore();
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/parts/timer/_timer.scss';
</style>
