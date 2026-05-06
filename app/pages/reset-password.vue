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

                <form v-if="isRecovery" @submit.prevent="handleSubmit">
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

                    <p v-if="formError" class="auth-error">{{ formError }}</p>

                    <!-- ----- * Submit * ----- -->
                    <ui-button
                        type="submit"
                        class="auth-btn"
                        :disabled="loading"
                    >
                        {{ loading ? 'Updating…' : 'Update password' }}
                    </ui-button>
                </form>

                <div v-else-if="linkError" class="auth-success">
                    <p>{{ linkError }}</p>
                    <NuxtLink to="/forgot-password">
                        Request a new reset link
                    </NuxtLink>
                </div>
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

const RECOVERY_FLAG = 'supabase:password_recovery';

const supabase = useSupabaseClient();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const isRecovery = ref(false);
const linkError = ref('');
const formError = ref('');

const errors = reactive({ password: '', confirmPassword: '' });

let unsubscribe: (() => void) | undefined;

onMounted(() => {
    const hash = window.location.hash;

    // Surface error from the recovery link (expired, malformed, etc.).
    if (hash.includes('error_description')) {
        const params = new URLSearchParams(hash.slice(1));
        linkError.value =
            params.get('error_description')?.replace(/\+/g, ' ') ??
            'This password reset link is invalid or has expired.';
        return;
    }

    // Plugin set the flag when PASSWORD_RECOVERY fired.
    if (sessionStorage.getItem(RECOVERY_FLAG) === '1') {
        isRecovery.value = true;
        return;
    }

    // We may have mounted before supabase-js stripped the hash.
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
        isRecovery.value = true;
        return;
    }

    // Subscribe in case PASSWORD_RECOVERY fires during this page's lifetime.
    const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            isRecovery.value = true;
        }
    });
    unsubscribe = () => data.subscription.unsubscribe();

    // If nothing has signalled a recovery shortly after mount, the user
    // arrived here without a valid recovery link.
    setTimeout(() => {
        if (!isRecovery.value) {
            linkError.value =
                'This password reset link is invalid or has expired.';
        }
    }, 500);
});

onUnmounted(() => unsubscribe?.());

async function handleSubmit() {
    errors.password = '';
    errors.confirmPassword = '';
    formError.value = '';

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
        formError.value = authError.message;
        return;
    }

    sessionStorage.removeItem(RECOVERY_FLAG);
    await router.push('/');
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
