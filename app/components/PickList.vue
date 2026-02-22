<template>
    <aside class="pick-list">
        <!-- ----------------- [ Themes ] ----------------- -->
        <parts-pick-list-theme-list />

        <!-- ----------------- [ Settings ] ----------------- -->
        <ui-button
            variant="icon"
            title="Settings"
            @click="emit('open-settings')"
        >
            <Icon icon="heroicons:cog-6-tooth" width="20" />
        </ui-button>
    </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

const emit = defineEmits<{
    (e: 'open-settings'): void;
}>();
</script>

<style scoped lang="scss">
.pick-list {
    display: flex;
    gap: spacing(2);
    align-items: center;
    padding: spacing(2);
    width: $picker-width;
    flex-direction: column;
    justify-content: center;
}
</style>
