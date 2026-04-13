<template>
    <div class="auth-page">
        <div class="auth-card">
            <!-- ----------------- [ Left side ] ----------------- -->
            <div class="auth-card__left">
                <ui-button to="/login" variant="icon" class="button-back">
                    <FontAwesomeIcon
                        :icon="['far', 'arrow-left']"
                        class="icon-small"
                    />
                </ui-button>

                <NuxtLink to="/" class="auth-logo">
                    <ui-logo-text />
                </NuxtLink>

                <form v-if="!confirmed" @submit.prevent="handleSignup">
                    <!-- ----- * Email * ----- -->
                    <ui-input
                        id="signup_email"
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
                        id="signup_password"
                        v-model="password"
                        label="Password"
                        required
                        type="password"
                        :min-length="8"
                        :disabled="loading"
                        placeholder="••••••••"
                        :leftIcon="['far', 'shield-keyhole']"
                    />

                    <!-- ----- * Confirm password * ----- -->
                    <ui-input
                        id="signup_confirm_password"
                        v-model="confirmPassword"
                        label="Confirm password"
                        required
                        type="password"
                        :min-length="8"
                        :disabled="loading"
                        placeholder="••••••••"
                        :leftIcon="['far', 'shield-keyhole']"
                    />

                    <p v-if="error" class="auth-error">{{ error }}</p>

                    <!-- ----- * Submit * ----- -->
                    <ui-button
                        type="submit"
                        class="auth-btn"
                        :disabled="loading"
                    >
                        {{ loading ? 'Creating account…' : 'Sign up' }}
                    </ui-button>
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
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
