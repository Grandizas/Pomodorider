<template>
    <div class="ach-modal" v-if="isOpen">
        <div class="ach-overlay" @click="$emit('close')"></div>
        <div
            class="ach-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ach-title"
        >
            <div class="ach-header">
                <h2 id="ach-title">Achievements</h2>
                <ui-button
                    variant="icon"
                    aria-label="Close achievements"
                    @click="$emit('close')"
                >
                    <FontAwesomeIcon
                        :icon="['far', 'xmark']"
                        class="icon-regular"
                    />
                </ui-button>
            </div>

            <p class="ach-progress">
                {{ store.unlockedCount }} / {{ ACHIEVEMENTS.length }} unlocked
            </p>

            <ul class="ach-grid">
                <li
                    v-for="a in ACHIEVEMENTS"
                    :key="a.key"
                    class="ach-card"
                    :class="{ 'is-unlocked': store.isUnlocked(a.key) }"
                    :title="
                        store.isUnlocked(a.key)
                            ? a.description
                            : `Locked — ${a.description}`
                    "
                >
                    <span class="ach-card__icon">
                        <FontAwesomeIcon
                            :icon="[
                                'far',
                                store.isUnlocked(a.key) ? a.icon : 'lock',
                            ]"
                            class="icon-regular"
                        />
                    </span>
                    <span class="ach-card__name">{{ a.name }}</span>
                    <span class="ach-card__desc">{{ a.description }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENTS } from '~~/constants/achievements';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{ isOpen: boolean }>();
defineEmits<{ close: [] }>();

const store = useAchievementsStore();
</script>

<style scoped lang="scss">
.ach-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ach-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
}

.ach-content {
    position: relative;
    width: min(92vw, rem(560px));
    max-height: 85vh;
    overflow-y: auto;
    padding: $spacing-lg;
    border-radius: rem(16px);
    background: $button-background-color;
    box-shadow: 0 rem(20px) rem(60px) rgba(0, 0, 0, 0.35);
}

.ach-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
        margin: 0;
    }
}

.ach-progress {
    margin: rem(4px) 0 $spacing-md;
    color: $text-secondary;
    font-size: rem(14px);
}

.ach-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(rem(140px), 1fr));
    gap: $spacing-md;
    margin: 0;
    padding: 0;
    list-style: none;
}

.ach-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(6px);
    padding: $spacing-md rem(10px);
    text-align: center;
    border-radius: rem(12px);
    background: rgba(255, 255, 255, 0.04);
    opacity: 0.55;
    filter: grayscale(1);
    transition:
        opacity $transition-fast,
        filter $transition-fast;

    &.is-unlocked {
        opacity: 1;
        filter: none;
        background: rgba(245, 158, 11, 0.12);
    }

    &__icon {
        color: #f59e0b;
        line-height: 0;
    }

    &__name {
        font-weight: 700;
        font-size: rem(14px);
        color: $text-color;
    }

    &__desc {
        font-size: rem(12px);
        color: $text-secondary;
    }
}
</style>
