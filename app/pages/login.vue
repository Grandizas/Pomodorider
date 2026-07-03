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
                        :error="errors.email"
                    />

                    <div>
                        <!-- ----- * Password * ----- -->
                        <ui-input
                            id="login_password"
                            v-model="password"
                            label="Password"
                            required
                            type="password"
                            :disabled="loading"
                            placeholder="••••••••••••••••"
                            :leftIcon="['far', 'shield-keyhole']"
                            :error="errors.password"
                        />

                        <!-- ----- * Forgot password * ----- -->
                        <div class="checkbox-group">
                            <nuxt-link to="/forgot-password" class="auth-link">
                                Forgot password?
                            </nuxt-link>
                        </div>
                    </div>

                    <p v-if="formError" class="auth-error">{{ formError }}</p>

                    <!-- ----- * Submit * ----- -->
                    <ui-button
                        type="submit"
                        class="auth-btn"
                        :disabled="loading"
                    >
                        {{ loading ? 'Signing in…' : 'Sign in' }}
                    </ui-button>
                </form>

                <ui-google-button />

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
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const formError = ref('');

const errors = reactive({ email: '', password: '' });

async function handleLogin() {
    errors.email = '';
    errors.password = '';
    formError.value = '';
    loading.value = true;

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });

    loading.value = false;

    if (authError) {
        formError.value = authError.message;
        return;
    }

    await router.push('/app');
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_login.scss';
</style>
