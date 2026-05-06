<template>
    <div class="auth-page">
        <div class="auth-card">
            <p v-if="error" class="auth-error">{{ error }}</p>
            <p v-else>Confirming your account…</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const router = useRouter();
const user = useSupabaseUser();
const error = ref('');

// Parse the hash synchronously during setup so the immediate watch below
// doesn't redirect a logged-in user before we read the link's error state.
if (import.meta.client) {
    const hash = window.location.hash;
    if (hash.includes('error_description')) {
        const params = new URLSearchParams(hash.slice(1));
        error.value =
            params.get('error_description') ??
            'Something went wrong. Please try again.';
    }
}

// Redirect once @nuxtjs/supabase sets the session — no arbitrary delay needed.
watch(
    user,
    (newUser) => {
        if (newUser && !error.value) {
            router.push('/');
        }
    },
    { immediate: true },
);

// Stuck-state fallback: if there's no session and no error after a few seconds,
// the link is stale or invalid — send the user to login rather than spin forever.
onMounted(() => {
    setTimeout(() => {
        if (!user.value && !error.value) {
            router.push('/login');
        }
    }, 5000);
});
</script>

<style scoped lang="scss">
@use 'sass:map';

.auth-page {
    display: flex;
    min-height: 100vh;
    padding: spacing(2);
    align-items: center;
    justify-content: center;
}

.auth-card {
    text-align: center;
}

.auth-error {
    color: map.get($colors, red, 500);
    font-size: $text-md;
}
</style>
