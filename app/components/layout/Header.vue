<template>
    <header class="app-header">
        <NuxtLink to="/" class="brand">
            <img src="/images/logo.svg" alt="" class="brand__logo" />
            <span class="brand__name">Pomodorider</span>
        </NuxtLink>

        <div class="topbar-right">
            <template v-if="user">
                <div
                    v-if="streakStore.loaded"
                    class="streak-pill"
                    :class="{ 'is-lit': streakStore.hasStreak }"
                    :title="`Current streak: ${streakStore.currentStreak} day${
                        streakStore.currentStreak === 1 ? '' : 's'
                    } · Longest: ${streakStore.longestStreak}`"
                >
                    <FontAwesomeIcon
                        :icon="['fas', 'fire']"
                        class="streak-pill__flame"
                    />
                    <span class="streak-pill__n">{{
                        streakStore.currentStreak
                    }}</span>
                </div>

                <NuxtLink
                    v-if="!onAnalytics"
                    to="/analytics"
                    class="icon-link"
                    title="Your stats"
                    aria-label="Your stats"
                >
                    <FontAwesomeIcon :icon="['far', 'chart-line']" />
                </NuxtLink>

                <div class="acct">
                    <span class="acct__avatar">
                        <FontAwesomeIcon :icon="['fas', 'user']" />
                    </span>
                    <span class="acct__email">{{ user.email }}</span>
                </div>

                <button
                    class="btn-ghost"
                    :disabled="loggingOut"
                    @click="handleLogout"
                >
                    {{ loggingOut ? '…' : 'Log out' }}
                </button>
            </template>

            <template v-else>
                <ui-button to="/login">Login</ui-button>
                <ui-tooltip aria-label="Why sign in?">
                    <p class="signin-hint__title">Sign in to unlock:</p>
                    <ul class="signin-hint__list">
                        <li>🔥 Keep your daily streak</li>
                        <li>🏆 Earn achievements</li>
                        <li>📊 Sync stats across devices</li>
                        <li>📅 Never lose your history</li>
                    </ul>
                </ui-tooltip>
            </template>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useStreakStore } from '~~/stores/streak';

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const route = useRoute();
const streakStore = useStreakStore();

const loggingOut = ref(false);
const onAnalytics = computed(() => route.path === '/analytics');

async function handleLogout() {
    loggingOut.value = true;
    try {
        await supabase.auth.signOut();
        await router.push('/');
    } finally {
        loggingOut.value = false;
    }
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/layout/_header.scss';
</style>
