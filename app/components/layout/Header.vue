<template>
    <header class="app-header">
        <div class="auth-info">
            <!--
             * If authenticated
            -->
            <template v-if="user">
                <span class="user-email">{{ user.email }}</span>
                <ui-button
                    class="logout-btn"
                    :disabled="loggingOut"
                    @click="handleLogout"
                >
                    {{ loggingOut ? '…' : 'Log out' }}
                </ui-button>
            </template>

            <ui-button v-else to="/login">Login</ui-button>
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
