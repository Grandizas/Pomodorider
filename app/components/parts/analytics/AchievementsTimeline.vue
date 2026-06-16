<template>
    <div class="ach-list">
        <div
            v-for="a in ACHIEVEMENTS"
            :key="a.key"
            class="ach"
            :class="unlockedAt(a.key) ? 'unlocked' : 'locked'"
        >
            <span class="badge">
                <FontAwesomeIcon
                    :icon="['far', unlockedAt(a.key) ? a.icon : 'lock']"
                />
            </span>
            <div class="info">
                <div class="t">{{ a.name }}</div>
                <div class="d">{{ a.description }}</div>
            </div>
            <div class="status">
                {{ unlockedAt(a.key) ? formatDate(unlockedAt(a.key)!) : 'Locked' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENTS } from '~~/constants/achievements';

const store = useAchievementsStore();

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
.ach-list {
    display: flex;
    flex-direction: column;
    gap: rem(12px);
}

.ach {
    display: flex;
    align-items: center;
    gap: rem(18px);
    padding: rem(18px) rem(22px);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    outline: 1px solid rgba(255, 255, 255, 0.04);

    &.locked {
        opacity: 0.55;
    }

    &.unlocked {
        background: linear-gradient(
            180deg,
            rgba(var(--flame-rgb), 0.12),
            rgba(var(--flame-rgb), 0.04)
        );
        outline: 1px solid rgba(var(--flame-rgb), 0.3);
        box-shadow: 0 0 30px rgba(var(--flame-rgb), 0.12);
    }

    .badge {
        width: rem(44px);
        height: rem(44px);
        border-radius: 50%;
        flex: none;
        display: grid;
        place-items: center;
        background: $button-background-color;
        color: $text-secondary;
        font-size: rem(18px);
    }

    &.unlocked .badge {
        background: radial-gradient(circle at 50% 30%, #4a4a4a, #2a2a2a);
        color: var(--flame-2);
        box-shadow:
            0 0 18px rgba(var(--flame-rgb), 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .info {
        flex: 1;
        min-width: 0;

        .t {
            font-weight: 700;
            font-size: rem(16px);
        }

        .d {
            font-size: rem(13.6px);
            color: $text-secondary;
            margin-top: 3px;
        }
    }

    .status {
        font-size: rem(13.6px);
        color: $text-secondary;
        white-space: nowrap;
    }

    &.unlocked .status {
        color: rgb(var(--color-timerBg));
    }
}
</style>
