// Captures Supabase's PASSWORD_RECOVERY event the moment supabase-js processes
// a recovery link hash. Set early enough to fire before /reset-password mounts.
// The flag is read in app/pages/reset-password.vue to gate the form.
export default defineNuxtPlugin(() => {
    const supabase = useSupabaseClient();
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            sessionStorage.setItem('supabase:password_recovery', '1');
        }
    });
});
