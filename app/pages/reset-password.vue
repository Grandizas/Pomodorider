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

                <form @submit.prevent="handleSubmit">
                    <!-- ----- * Password * ----- -->
                    <ui-input
                        id="reset_password"
                        v-model="password"
                        label="New password"
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
                        id="reset_confirm_password"
                        v-model="confirmPassword"
                        label="Confirm new password"
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
                        {{ loading ? 'Updating…' : 'Update password' }}
                    </ui-button>
                </form>
            </div>

            <!-- ----------------- [ Right side ] ----------------- -->
            <div class="auth-card__right">
                <p class="auth-card__right--title">
                    Stay <span>focused</span>. Track your time with
                    <span>precision</span>. Build better
                    <span>habits</span> every day.
                </p>
                <img
                    src="@@/public/images/login_image_1.png"
                    alt="Dark sphere under the white light"
                />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const errors = reactive({ password: '', confirmPassword: '' });

async function handleSubmit() {
    errors.password = '';
    errors.confirmPassword = '';

    if (password.value !== confirmPassword.value) {
        errors.confirmPassword = 'Passwords do not match.';
        return;
    }

    loading.value = true;

    const { error: authError } = await supabase.auth.updateUser({
        password: password.value,
    });

    loading.value = false;

    if (authError) {
        errors.password = authError.message;
        return;
    }

    await router.push('/');
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
