<template>
    <div class="auth-page">
        <div class="auth-card">
            <NuxtLink to="/" class="auth-logo">
                <ui-svg-logo />
            </NuxtLink>

            <h1>Welcome back</h1>

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
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.auth-card {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    h1 {
        font-size: 1.5rem;
        margin: 0;
    }
}

.auth-logo {
    display: flex;
    text-decoration: none;
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
        font-size: 0.875rem;
        font-weight: 500;
    }

    input {
        padding: 0.6rem 0.75rem;
        border: 1px solid currentColor;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font-size: 1rem;
        font-family: inherit;
        outline: none;

        &:focus {
            outline: 2px solid currentColor;
            outline-offset: 1px;
        }

        &:disabled {
            opacity: 0.5;
        }
    }
}

.auth-error {
    margin: 0;
    font-size: 0.875rem;
    color: #e53e3e;
}

.auth-btn {
    padding: 0.65rem 1rem;
    border: 1px solid currentColor;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;

    &:hover:not(:disabled) {
        opacity: 0.8;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.auth-switch {
    font-size: 0.875rem;
    margin: 0;

    a {
        color: inherit;
        font-weight: 500;
    }
}
</style>
