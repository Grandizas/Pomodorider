import type { Database } from '~/types/database.types';
import { useSubscriptionStore } from '~~/stores/subscription';
import {
    PRO_GATING_ENABLED,
    FREE_LIMITS,
    PRO_LIMITS,
    type ProFeature,
    type LimitKey,
} from '~~/constants/proFeatures';

/**
 * The single entitlement check for the whole app. Gate every Pro feature
 * through `isPro` / `can()` / `limit()` here — never read `subscription_status`
 * or the limit constants directly — so the global `PRO_GATING_ENABLED` switch is
 * always respected and launch is a one-line change.
 *
 * While gating is off, `isPro` is `true` for everyone and `limit()` returns the
 * Pro (unlimited) values, so wrapping a feature in these helpers today is a
 * no-op — it only starts enforcing once the switch is flipped.
 *
 * See `subscription.client.ts` for loading the billing state on auth change.
 */
export function useIsPro() {
    const supabase = useSupabaseClient<Database>();
    const user = useSupabaseUser();
    const store = useSubscriptionStore();

    /** Auth id lives in the JWT `sub` claim; fall back to `id`. Null = logged out. */
    function currentUserId(): string | null {
        const u = user.value as { id?: string; sub?: string } | null;
        return u?.sub ?? u?.id ?? null;
    }

    /**
     * Reactive Pro entitlement. While `PRO_GATING_ENABLED` is false this is
     * always true (everyone gets everything); once gating is on it reflects the
     * user's real subscription.
     */
    const isPro = computed(
        () => !PRO_GATING_ENABLED || store.hasActiveSubscription,
    );

    /**
     * Whether the current user may use a given Pro feature. Takes a feature key
     * so call sites read intentionally (`can('advanced_stats')`) and so we can
     * later carve out exceptions (e.g. a feature that stays free) without
     * touching callers. Today all Pro features share the one `isPro` gate.
     */
    function can(feature: ProFeature): boolean {
        void feature;
        return isPro.value;
    }

    /** The active limit for a metered capability, honouring the gating switch. */
    function limit(key: LimitKey): number {
        return isPro.value ? PRO_LIMITS[key] : FREE_LIMITS[key];
    }

    /**
     * Pull the user's billing state into the store. No-ops to a reset state when
     * logged out. Bound to the uid captured at the start so an auth change
     * mid-flight can't apply a stale result to a new account.
     */
    async function load() {
        const uid = currentUserId();
        if (!uid) {
            store.reset();
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('subscription_status, subscription_end_at')
            .eq('id', uid)
            .maybeSingle();

        if (currentUserId() !== uid) return; // auth flipped mid-flight
        if (error) {
            console.error('[subscription] failed to fetch status', error);
            return;
        }

        store.set({
            status: data?.subscription_status ?? 'free',
            endsAt: data?.subscription_end_at ?? null,
        });
    }

    return { isPro, can, limit, load };
}
