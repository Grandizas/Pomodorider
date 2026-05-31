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
                        placeholder="••••••••••••••••"
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
                        placeholder="••••••••••••••••"
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
                    src="@@/public/images/login_image_1.webp"
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

    // Fallback if the plugin missed the arrival pattern. Two cases:
    //   - Implicit flow: `type=recovery` in the hash.
    //   - PKCE flow: a `code` query param, before supabase-js strips it.
    // Match the exact `code` param — a substring check (`includes('code=')`)
    // would also match the `error_code` param on a PKCE error redirect and
    // wrongly show the form for a dead link. We're on /reset-password, so a
    // code here can only have come from a recovery email's redirect_to.
    if (
        hash.includes('type=recovery') ||
        new URLSearchParams(window.location.search).has('code')
    ) {
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

    // If nothing has signaled a recovery shortly after mount, the user
    // arrived here without a valid recovery link. 3s gives the PKCE code-exchange
    // round-trip enough headroom on slow networks before we declare the link dead.
    setTimeout(() => {
        if (!isRecovery.value) {
            linkError.value =
                'This password reset link is invalid or has expired.';
        }
    }, 3000);
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
