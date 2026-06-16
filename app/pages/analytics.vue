<template>
    <div class="analytics-page">
        <layout-header />

        <main class="analytics-main">
            <div class="analytics-head">
                <h1 class="analytics-title">Your stats</h1>
                <ui-button
                    v-if="
                        user &&
                        loaded &&
                        summary.totalSessions > 0 &&
                        can('data_export')
                    "
                    variant="secondary"
                    title="Download your sessions as CSV"
                    @click="exportCsv"
                >
                    Export CSV
                </ui-button>
            </div>

            <!-- Logged-out: analytics are a signed-in feature, like streaks. -->
            <div v-if="!user" class="analytics-empty">
                <p>Sign in to track your focus stats across devices.</p>
                <ui-button to="/login">Login</ui-button>
            </div>

            <div v-else-if="error" class="analytics-empty">
                <p>{{ error }}</p>
                <ui-button @click="reload">Retry</ui-button>
            </div>

            <div v-else-if="loading && !loaded" class="analytics-empty">
                <p>Loading your stats…</p>
            </div>

            <div
                v-else-if="loaded && summary.totalSessions === 0"
                class="analytics-empty"
            >
                <p>No focus sessions yet — finish a Pomodoro to get started!</p>
                <ui-button to="/">Start a timer</ui-button>
            </div>

            <template v-else>
                <!-- Headline numbers -->
                <section class="analytics-cards">
                    <parts-analytics-stat-card
                        label="Total focus"
                        :value="formatMinutes(summary.totalFocusMins)"
                        :sub="`${summary.totalSessions} session${summary.totalSessions === 1 ? '' : 's'}`"
                    />
                    <parts-analytics-stat-card
                        label="Today"
                        :value="formatMinutes(summary.todayFocusMins)"
                        :sub="`${summary.todaySessions} session${summary.todaySessions === 1 ? '' : 's'}`"
                    />
                    <parts-analytics-stat-card
                        label="This week"
                        :value="formatMinutes(summary.weekFocusMins)"
                        :sub="`${summary.weekSessions} session${summary.weekSessions === 1 ? '' : 's'}`"
                    />
                    <parts-analytics-stat-card
                        label="Current streak"
                        :value="`${streakStore.currentStreak} day${streakStore.currentStreak === 1 ? '' : 's'}`"
                        :sub="`Longest: ${streakStore.longestStreak}`"
                    />
                    <parts-analytics-stat-card
                        v-if="summary.bestDay"
                        label="Best day"
                        :value="formatMinutes(summary.bestDay.minutes)"
                        :sub="formatDay(summary.bestDay.day)"
                    />
                </section>

                <!-- Daily focus chart -->
                <section class="analytics-section">
                    <div class="analytics-section__head">
                        <h2>Focus over time</h2>
                        <div class="analytics-range" role="group" aria-label="Range">
                            <button
                                v-for="opt in RANGE_OPTIONS"
                                :key="opt"
                                class="analytics-range__btn"
                                :class="{
                                    'is-active': range === opt,
                                    'is-locked': rangeLocked(opt),
                                }"
                                :disabled="rangeLocked(opt)"
                                :title="
                                    rangeLocked(opt)
                                        ? 'Upgrade to Pro to see more history'
                                        : undefined
                                "
                                @click="selectRange(opt)"
                            >
                                {{ opt }}d
                                <FontAwesomeIcon
                                    v-if="rangeLocked(opt)"
                                    :icon="['far', 'lock']"
                                    class="analytics-range__lock"
                                />
                            </button>
                        </div>
                    </div>
                    <parts-analytics-daily-bar-chart :points="series" />
                </section>

                <!-- Advanced stats (Pro). While gating is off, can() is true for
                     everyone, so these show unlocked; once on, free users get the
                     upgrade teaser instead. -->
                <template v-if="can('advanced_stats')">
                    <section class="analytics-section">
                        <div class="analytics-section__head">
                            <h2>Activity</h2>
                            <span class="analytics-section__meta">
                                Last {{ HEATMAP_WEEKS }} weeks
                            </span>
                        </div>
                        <parts-analytics-heatmap :points="heatmapPoints" />
                    </section>

                    <section class="analytics-section">
                        <div class="analytics-section__head">
                            <h2>Time of day</h2>
                            <span
                                v-if="peakHourLabel"
                                class="analytics-section__meta"
                            >
                                Most focused around {{ peakHourLabel }}
                            </span>
                        </div>
                        <parts-analytics-hourly-chart :hours="hourly" />
                    </section>
                </template>

                <!-- Upgrade teaser. No CTA button yet — the checkout flow isn't
                     built. This branch is also dormant until PRO_GATING_ENABLED
                     is flipped on. -->
                <section v-else class="analytics-section analytics-upsell">
                    <FontAwesomeIcon
                        :icon="['far', 'chart-line']"
                        class="analytics-upsell__icon"
                    />
                    <div>
                        <h2>{{ advancedStats.title }}</h2>
                        <p class="analytics-upsell__desc">
                            {{ advancedStats.description }} Available with Pro.
                        </p>
                    </div>
                </section>

                <!-- Achievements -->
                <section class="analytics-section">
                    <div class="analytics-section__head">
                        <h2>Achievements</h2>
                        <span class="analytics-section__meta">
                            {{ achievementsStore.unlockedCount }} /
                            {{ ACHIEVEMENTS.length }} unlocked
                        </span>
                    </div>
                    <parts-analytics-achievements-timeline />
                </section>
            </template>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useHead } from '#imports';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useAnalytics, formatMinutes } from '~/composables/useAnalytics';
import { useIsPro } from '~/composables/useIsPro';
import { useStreakStore } from '~~/stores/streak';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENTS } from '~~/constants/achievements';
import { PRO_FEATURES } from '~~/constants/proFeatures';

const user = useSupabaseUser();
const streakStore = useStreakStore();
const achievementsStore = useAchievementsStore();
const { limit, can } = useIsPro();
const { summary, hourly, loading, loaded, error, load, recentSeries, exportCsv } =
    useAnalytics();

const advancedStats = PRO_FEATURES.advanced_stats;

// History range is a metered Pro capability: free users are capped at
// `historyDays` (7), Pro is unlimited. While PRO_GATING_ENABLED is off this is
// Infinity for everyone, so every range is unlocked and nothing changes yet.
const RANGE_OPTIONS = [7, 30] as const;
const historyDays = computed(() => limit('historyDays'));
const range = ref<number>(7);

function rangeLocked(days: number): boolean {
    return days > historyDays.value;
}
function selectRange(days: number) {
    if (!rangeLocked(days)) range.value = days;
}

// Never plot more than the user is entitled to, even if a stale selection
// outlives an entitlement change (e.g. logout). min(n, Infinity) === n.
const series = computed(() =>
    recentSeries(Math.min(range.value, historyDays.value)),
);

// Advanced (Pro) views. History is unlimited for Pro, so the heatmap always
// shows the full window regardless of the free `historyDays` cap above.
const HEATMAP_WEEKS = 12;
const heatmapPoints = computed(() => recentSeries(HEATMAP_WEEKS * 7));

/** Busiest hour as a friendly label, e.g. "2 PM"; null until there's data. */
const peakHourLabel = computed(() => {
    let peak = -1;
    let best = 0;
    for (const h of hourly.value) {
        if (h.minutes > best) {
            best = h.minutes;
            peak = h.hour;
        }
    }
    if (peak < 0) return null;
    const period = peak < 12 ? 'AM' : 'PM';
    const h12 = peak % 12 === 0 ? 12 : peak % 12;
    return `${h12} ${period}`;
});

function reload() {
    void load();
}

/** 'YYYY-MM-DD' → "Mon, Jun 16" (local, no timezone drift). */
function formatDay(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

onMounted(reload);
// Reload (or clear) whenever auth settles or changes.
watch(user, reload);

useHead({ title: 'Your stats - Pomodorider' });
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/breakpoints' as *;

.analytics-page {
    display: flex;
    flex-direction: column;
}

.analytics-main {
    width: 100%;
    max-width: rem(880px);
    margin: 0 auto;
    padding: $spacing-lg $spacing-md $spacing-xl;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
}

.analytics-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
}

.analytics-title {
    font-size: rem(28px);
    font-weight: 700;
    color: $text-color;
}

.analytics-upsell {
    flex-direction: row;
    align-items: center;
    gap: $spacing-md;

    &__icon {
        font-size: rem(22px);
        color: #f59e0b;
        flex-shrink: 0;
    }

    h2 {
        font-size: rem(16px);
        font-weight: 600;
        color: $text-color;
    }

    &__desc {
        font-size: rem(13px);
        color: $text-secondary;
        margin-top: spacing(0.25);
    }
}

.analytics-empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
    padding: $spacing-lg;
    border-radius: $radius-xl;
    background: $button-background-color;
    color: $text-secondary;
}

.analytics-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(rem(150px), 1fr));
    gap: $spacing-md;
}

.analytics-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    padding: $spacing-md;
    border-radius: $radius-xl;
    background: rgba(255, 255, 255, 0.02);

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $spacing-sm;

        h2 {
            font-size: rem(18px);
            font-weight: 600;
            color: $text-color;
        }
    }

    &__meta {
        font-size: rem(13px);
        color: $text-secondary;
    }
}

.analytics-range {
    display: inline-flex;
    gap: spacing(0.5);

    &__btn {
        padding: spacing(0.5) spacing(1.5);
        border: none;
        border-radius: $radius-full;
        background: $button-background-color;
        color: $text-secondary;
        font-size: rem(13px);
        font-weight: 600;
        cursor: pointer;
        transition:
            background $transition-fast,
            color $transition-fast;

        &.is-active {
            background: #f59e0b;
            color: #1a1a1a;
        }

        &.is-locked {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }

    &__lock {
        margin-left: spacing(0.5);
        font-size: rem(10px);
    }
}

@include respond-to(tablet) {
    .analytics-section__head {
        flex-wrap: wrap;
    }
}
</style>
