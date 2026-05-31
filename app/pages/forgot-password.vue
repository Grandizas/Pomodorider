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

                <form v-if="!sent" @submit.prevent="handleSubmit">
                    <!-- ----- * Email * ----- -->
                    <ui-input
                        id="forgot_email"
                        v-model="email"
                        label="Email"
                        required
                        type="email"
                        :disabled="loading"
                        placeholder="you@example.com"
                        :leftIcon="['far', 'envelope']"
                    />

                    <p v-if="formError" class="auth-error">{{ formError }}</p>

                    <!-- ----- * Submit * ----- -->
                    <ui-button
                        type="submit"
                        class="auth-btn"
                        :disabled="loading"
                    >
                        {{ loading ? 'Sending…' : 'Send reset link' }}
                    </ui-button>
                </form>

                <div v-else class="auth-success">
                    <p>
                        If an account exists for
                        <strong>{{ email }}</strong
                        >, we've sent a password reset link.
                    </p>
                    <NuxtLink to="/login">Back to login</NuxtLink>
                </div>

                <p v-if="!sent" class="auth-switch">
                    Remembered your password?
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
                <img
                    src="@@/public/images/login_image_1.webp"
                    alt="Dark sphere under the white light"
                />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

definePageMeta({ layout: false, middleware: 'guest' });

const supabase = useSupabaseClient();
const config = useRuntimeConfig();

const email = ref('');
const loading = ref(false);
const sent = ref(false);
const formError = ref('');

async function handleSubmit() {
    formError.value = '';
    loading.value = true;

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.value,
        { redirectTo: `${config.public.appUrl}/reset-password` },
    );

    loading.value = false;

    if (authError) {
        formError.value = authError.message;
        return;
    }

    sent.value = true;
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
