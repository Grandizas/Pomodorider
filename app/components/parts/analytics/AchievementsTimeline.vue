<template>
    <ul class="ach-timeline">
        <li
            v-for="a in ACHIEVEMENTS"
            :key="a.key"
            class="ach-timeline__item"
            :class="{ 'is-unlocked': unlockedAt(a.key) }"
        >
            <span class="ach-timeline__icon">
                <FontAwesomeIcon
                    :icon="['far', unlockedAt(a.key) ? a.icon : 'lock']"
                    class="icon-regular"
                />
            </span>
            <span class="ach-timeline__body">
                <span class="ach-timeline__name">{{ a.name }}</span>
                <span class="ach-timeline__desc">{{ a.description }}</span>
            </span>
            <span class="ach-timeline__when">
                {{ unlockedAt(a.key) ? formatDate(unlockedAt(a.key)!) : 'Locked' }}
            </span>
        </li>
    </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENTS } from '~~/constants/achievements';

const store = useAchievementsStore();

/** key -> ISO unlock timestamp, for the ones this user has earned. */
const unlockedMap = computed(
    () => new Map(store.unlocked.map((u) => [u.key, u.unlockedAt])),
);

function unlockedAt(key: string): string | undefined {
    return unlockedMap.value.get(key);
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
</script>

<style scoped lang="scss">
.ach-timeline {
    display: flex;
    flex-direction: column;
    gap: spacing(1);
    list-style: none;
    margin: 0;
    padding: 0;

    &__item {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-sm $spacing-md;
        border-radius: $radius-lg;
        background: $button-background-color;
        opacity: 0.55;
        transition: opacity $transition-fast;

        &.is-unlocked {
            opacity: 1;
        }
    }

    &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: rem(36px);
        height: rem(36px);
        flex-shrink: 0;
        border-radius: $radius-full;
        background: rgba(255, 255, 255, 0.06);
        color: $text-secondary;
        font-size: rem(15px);

        .is-unlocked & {
            color: #f59e0b;
        }
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: spacing(0.25);
        flex: 1 1 auto;
        min-width: 0;
    }

    &__name {
        font-weight: 600;
        color: $text-color;
    }

    &__desc {
        font-size: rem(13px);
        color: $text-secondary;
    }

    &__when {
        flex-shrink: 0;
        font-size: rem(12px);
        color: $text-secondary;
        white-space: nowrap;
    }
}
</style>
