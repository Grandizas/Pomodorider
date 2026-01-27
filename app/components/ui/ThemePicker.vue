<template>
    <div class="theme-picker">
        <ui-button>Themes</ui-button>
    </div>
</template>

<script setup lang="ts">
import { applyTheme } from '~/composable/applyTheme';

const currentTheme = 'ocean';

onMounted(() => {
    applyTheme(currentTheme);
});
</script>

<style scoped lang="scss"></style>
