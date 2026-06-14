/**
 * Pro feature catalogue and the limits that separate free from paid.
 *
 * Nothing here turns on a paywall by itself — gating is opt-in via
 * `PRO_GATING_ENABLED`. The point is to build Pro features now, behind a single
 * entitlement check (`useIsPro`), so that "going paid" later is flipping one
 * flag rather than retrofitting checks across the app.
 */

/**
 * Master switch for Pro gating.
 *
 * While `false` (the current state) EVERY user is treated as Pro, so Pro
 * features ship unlocked and there is no behavioural change anywhere — we can
 * build and dogfood them without a paywall. Flip to `true` at monetization
 * launch and `useIsPro` starts honouring each user's real subscription status.
 * This is the one line that turns the paywall on.
 */
export const PRO_GATING_ENABLED = false;

/** A gateable Pro capability. Add a key here as you build each feature. */
export type ProFeature =
    | 'advanced_stats'
    | 'unlimited_history'
    | 'data_export'
    | 'unlimited_themes'
    | 'custom_sounds'
    | 'integrations';

export interface ProFeatureMeta {
    /** Short label for upgrade prompts / pricing UI. */
    title: string;
    /** One-line pitch for what the user unlocks. */
    description: string;
}

/**
 * Human-facing copy for each Pro feature. Drives upgrade prompts and any future
 * pricing page, and keeps `ProFeature` keys and their descriptions in one place.
 */
export const PRO_FEATURES: Record<ProFeature, ProFeatureMeta> = {
    advanced_stats: {
        title: 'Advanced stats',
        description:
            'Heatmaps, time-of-day trends, and focus quality tracked over weeks.',
    },
    unlimited_history: {
        title: 'Unlimited history',
        description: 'See your full session history beyond the last 7 days.',
    },
    data_export: {
        title: 'Data export',
        description: 'Export your sessions and stats to CSV.',
    },
    unlimited_themes: {
        title: 'Unlimited themes',
        description: 'Create as many custom themes as you like.',
    },
    custom_sounds: {
        title: 'Custom sounds',
        description: 'Upload your own start, pause, and end sounds.',
    },
    integrations: {
        title: 'Integrations',
        description: 'Sync with Google Calendar, Todoist, and Notion.',
    },
};

/**
 * Metered capabilities where free and Pro differ by amount rather than on/off.
 * Prefer limits over hard locks: a free user who already made 2 themes converts
 * far better than one who never got to make any. Read these through
 * `useIsPro().limit(key)`, never directly, so the gating switch is respected.
 */
export const FREE_LIMITS = {
    /** Max custom themes a free user can keep. */
    customThemes: 2,
    /** How many days of session history a free user can browse. */
    historyDays: 7,
} as const;

export const PRO_LIMITS = {
    customThemes: Number.POSITIVE_INFINITY,
    historyDays: Number.POSITIVE_INFINITY,
} as const;

/** Names of the metered limits above. */
export type LimitKey = keyof typeof FREE_LIMITS;
