<template>
    <main class="auth-page">
        <div class="auth-card">
            <!-- ----------------- [ Left side ] ----------------- -->
            <div class="auth-card__left">
                <ui-button to="/" variant="icon" class="button-back">
                    <FontAwesomeIcon
                        :icon="['far', 'arrow-left']"
                        class="icon-small"
                    />
                </ui-button>

                <NuxtLink to="/" class="auth-logo">
                    <ui-logo-text />
                </NuxtLink>

                <form @submit.prevent="handleLogin">
                    <!-- ----- * Email * ----- -->
                    <ui-input
                        id="login_email"
                        v-model="email"
                        label="Email"
                        required
                        type="email"
                        :disabled="loading"
                        placeholder="you@example.com"
                        :leftIcon="['far', 'envelope']"
                    />

                    <!-- ----- * Password * ----- -->
                    <ui-input
                        id="login_password"
                        v-model="password"
                        label="Password"
                        required
                        type="password"
                        :disabled="loading"
                        placeholder="••••••••"
                        :leftIcon="['far', 'shield-keyhole']"
                    />

                    <p v-if="error" class="auth-error">{{ error }}</p>

                    <!-- ----- * Remember me, Forgot password * ----- -->
                    <div class="checkbox-group">
                        <ui-checkbox
                            id="login_remember"
                            text="Remember for 30 days"
                        />

                        <nuxt-link to="/" class="auth-link">
                            Forgot password?
                        </nuxt-link>
                    </div>

                    <!-- ----- * Submit * ----- -->
                    <ui-button
                        type="submit"
                        class="auth-btn"
                        :disabled="loading"
                    >
                        {{ loading ? 'Signing in…' : 'Sign in' }}
                    </ui-button>
                </form>

                <p class="auth-switch">
                    Don't have an account?
                    <NuxtLink to="/signup">Sign up</NuxtLink>
                </p>
            </div>

            <!-- ----------------- [ Right side ] ----------------- -->
            <div class="auth-card__right">
                <p class="auth-card__right--title">
                    Stay <span>focused</span>. Track your time with
                    <span>precision</span>. Build better
                    <span>habits</span> every day.
                </p>
                <img src="@@/public/images/login_image.png" alt="Hourglass" />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
