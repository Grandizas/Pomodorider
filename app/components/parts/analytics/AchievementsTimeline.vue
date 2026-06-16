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
                {{
                    unlockedAt(a.key)
                        ? formatDate(unlockedAt(a.key)!)
                        : 'Locked'
                }}
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
@use '@@/app/assets/styles/components/parts/analytics/_achievements-timeline.scss';
</style>
