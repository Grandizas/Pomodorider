// Marks a session as "this user came in via a password-reset email" so
// /reset-password can show its form. Two flows to cover:
//
//   - Implicit flow: tokens land in the URL hash and supabase-js fires
//     PASSWORD_RECOVERY when it parses them. Catch the event.
//
//   - PKCE flow (default in newer supabase-js): redirect URL is
//     /reset-password?code=<one-time-code>. supabase-js auto-exchanges the
//     code for a session and fires SIGNED_IN — *not* PASSWORD_RECOVERY — so
//     we have to detect the arrival pattern ourselves before the URL is
//     cleaned by history.replaceState.
const RECOVERY_FLAG = 'supabase:password_recovery';

export default defineNuxtPlugin(() => {
    const supabase = useSupabaseClient();

    if (
        window.location.pathname === '/reset-password' &&
        window.location.search.includes('code=')
    ) {
        sessionStorage.setItem(RECOVERY_FLAG, '1');
    }

    supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            sessionStorage.setItem(RECOVERY_FLAG, '1');
        }
    });
});
