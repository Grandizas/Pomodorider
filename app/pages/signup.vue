<template>
    <main class="auth-page">
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
                        :error="errors.email"
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
                        :error="errors.password"
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
                        :error="errors.confirmPassword"
                    />

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
                <img src="@@/public/images/login_image_2.png" alt="Hourglass" />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

definePageMeta({ layout: false });

const supabase = useSupabaseClient();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const confirmed = ref(false);

const errors = reactive({ email: '', password: '', confirmPassword: '' });

async function handleSignup() {
    errors.email = '';
    errors.password = '';
    errors.confirmPassword = '';

    if (password.value !== confirmPassword.value) {
        errors.confirmPassword = 'Passwords do not match.';
        return;
    }

    loading.value = true;

    const { data, error: authError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });

    loading.value = false;

    if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('password')) {
            errors.password = authError.message;
        } else {
            errors.email = authError.message;
        }
        return;
    }

    // Supabase silently "succeeds" for existing emails — identities will be empty
    if (data.user && data.user.identities?.length === 0) {
        errors.email = 'An account with this email already exists.';
        return;
    }

    confirmed.value = true;
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
