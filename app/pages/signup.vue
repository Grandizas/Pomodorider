<template>
    <div class="auth-page">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo">
                <ui-svg-logo />
            </NuxtLink>

            <h1>Create an account</h1>

            <form v-if="!confirmed" @submit.prevent="handleSignup">
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
                        minlength="8"
                    />
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm password</label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        :disabled="loading"
                    />
                </div>

                <p v-if="error" class="auth-error">{{ error }}</p>

                <button type="submit" class="auth-btn" :disabled="loading">
                    {{ loading ? 'Creating account…' : 'Sign up' }}
                </button>
            </form>

            <div v-else class="auth-success">
                <p>
                    Check your email — we sent a confirmation link to
                    <strong>{{ email }}</strong
                    >.
                </p>
                <NuxtLink to="/login">Go to login</NuxtLink>
            </div>

            <p v-if="!confirmed" class="auth-switch">
                Already have an account?
                <NuxtLink to="/login">Sign in</NuxtLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const supabase = useSupabaseClient();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const confirmed = ref(false);

async function handleSignup() {
    error.value = '';

    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.';
        return;
    }

    loading.value = true;

    const { error: authError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });

    loading.value = false;

    if (authError) {
        error.value = authError.message;
        return;
    }

    confirmed.value = true;
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
