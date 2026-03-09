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
const error = ref('');

// @nuxtjs/supabase handles the token exchange automatically via the callback route.
// This page is just shown briefly while the module redirects the user.
// If something goes wrong, show the error from the hash.
onMounted(() => {
    const hash = window.location.hash;
    if (hash.includes('error_description')) {
        const params = new URLSearchParams(hash.slice(1));
        error.value = params.get('error_description') ?? 'Something went wrong. Please try again.';
    } else {
        // Redirect home after a short delay; the supabase module will have set the session.
        setTimeout(() => router.push('/'), 1500);
    }
});
</script>

<style scoped lang="scss">
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.auth-card {
    text-align: center;
}

.auth-error {
    color: #e53e3e;
    font-size: 0.95rem;
}
</style>
