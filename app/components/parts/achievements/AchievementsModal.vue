<template>
    <div class="settings-panel" v-if="isOpen">
        <div class="settings-overlay" @click="$emit('close')"></div>
        <div
            class="settings-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ach-title"
        >
            <div class="settings-header">
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

            <div class="settings-body">
                <p class="ach-progress">
                    {{ store.unlockedCount }} / {{ ACHIEVEMENTS.length }}
                    unlocked
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
@use '@@/app/assets/styles/components/modals/_achievements.scss';
</style>
