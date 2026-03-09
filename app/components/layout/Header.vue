<template>
    <header class="app-header">
        <div class="auth-info">
            <!--
             * If authenticated
            -->
            <template v-if="user">
                <span class="user-email">{{ user.email }}</span>
                <button
                    class="logout-btn"
                    :disabled="loggingOut"
                    @click="handleLogout"
                >
                    {{ loggingOut ? '…' : 'Log out' }}
                </button>
            </template>

            <NuxtLink v-else to="/login">Login</NuxtLink>
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
    await supabase.auth.signOut();
    await router.push('/login');
    loggingOut.value = false;
}
</script>

<style scoped lang="scss">
.app-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0.75rem 1rem;
    min-height: 2.5rem;
}

.auth-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
}

.user-email {
    opacity: 0.7;
}

.logout-btn {
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 5px;
    color: inherit;
    font-family: inherit;
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    opacity: 0.8;

    &:hover:not(:disabled) {
        opacity: 1;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}
</style>
