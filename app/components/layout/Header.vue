<template>
    <header class="app-header">
        <div class="auth-info">
            <!--
             * If authenticated
            -->
            <template v-if="user">
                <parts-streak-badge />
                <span class="user-email">{{ user.email }}</span>
                <ui-button
                    class="logout-btn"
                    :disabled="loggingOut"
                    @click="handleLogout"
                >
                    {{ loggingOut ? '…' : 'Log out' }}
                </ui-button>
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
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const loggingOut = ref(false);

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
