<template>
    <div class="auth-page">
        <!-- ----------------- [ Background ] ----------------- -->
        <ui-background />

        <div class="auth-card">
            <!-- ----------------- [ Left side ] ----------------- -->
            <div class="auth-card__left">
                <div class="gradient-fade" />

                <NuxtLink to="/" class="auth-logo">
                    <ui-logo-text />
                </NuxtLink>

                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            :disabled="loading"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            :disabled="loading"
                        />
                    </div>

                    <p v-if="error" class="auth-error">{{ error }}</p>

                    <button type="submit" class="auth-btn" :disabled="loading">
                        {{ loading ? 'Signing in…' : 'Sign in' }}
                    </button>
                </form>

                <p class="auth-switch">
                    Don't have an account?
                    <NuxtLink to="/signup">Sign up</NuxtLink>
                </p>
            </div>

            <!-- ----------------- [ Right side ] ----------------- -->
            <div class="auth-card__right">
                <img src="@@/public/images/hourglass.png" alt="Hourglass" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
    error.value = '';
    loading.value = true;

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });

    loading.value = false;

    if (authError) {
        error.value = authError.message;
        return;
    }

    await router.push('/');
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
