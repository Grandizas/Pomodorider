<template>
    <Transition name="ach-toast">
        <div v-if="current" class="ach-toast" role="status" aria-live="polite">
            <span class="ach-toast__icon">
                <Icon :icon="current.icon" width="28" />
            </span>
            <div class="ach-toast__body">
                <p class="ach-toast__label">Achievement unlocked</p>
                <p class="ach-toast__name">{{ current.name }}</p>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENT_MAP, type AchievementDef } from '~~/constants/achievements';

const DISPLAY_MS = 5000;

const store = useAchievementsStore();
const current = ref<AchievementDef | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

/** Pull the next queued unlock and show it, chaining once it auto-dismisses. */
function showNext() {
    if (current.value) return; // one at a time
    const key = store.dequeueToast();
    if (!key) return;
    const def = ACHIEVEMENT_MAP[key];
    if (!def) {
        showNext(); // unknown key — skip it
        return;
    }
    current.value = def;
    timer = setTimeout(() => {
        current.value = null;
        timer = null;
        showNext();
    }, DISPLAY_MS);
}

watch(
    () => store.toastQueue.length,
    () => {
        if (!current.value) showNext();
    },
);

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
});
</script>

<style scoped lang="scss">
.ach-toast {
    position: fixed;
    right: $spacing-lg;
    bottom: $spacing-lg;
    z-index: 1100;
    display: flex;
    align-items: center;
    gap: rem(12px);
    padding: rem(12px) rem(16px);
    border-radius: rem(12px);
    background: $button-background-color;
    border: rem(1px) solid rgba(245, 158, 11, 0.5);
    box-shadow: 0 rem(10px) rem(30px) rgba(0, 0, 0, 0.35);

    &__icon {
        color: #f59e0b;
        line-height: 0;
    }

    &__label {
        margin: 0;
        font-size: rem(11px);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: $text-secondary;
    }

    &__name {
        margin: 0;
        font-weight: 700;
        color: $text-color;
    }
}

.ach-toast-enter-active,
.ach-toast-leave-active {
    transition:
        transform $transition-fast,
        opacity $transition-fast;
}

.ach-toast-enter-from,
.ach-toast-leave-to {
    transform: translateY(rem(12px));
    opacity: 0;
}
</style>
