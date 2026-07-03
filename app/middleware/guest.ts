// Bounces signed-in users away from auth-only pages (login, signup, forgot-password).
// Do NOT apply to /reset-password — a recovery session looks identical to a normal one,
// and we want users *with* a session to be the only ones who can complete the form.
export default defineNuxtRouteMiddleware(() => {
    const user = useSupabaseUser();
    if (user.value) {
        return navigateTo('/app');
    }
});
