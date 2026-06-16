<template>
    <div class="analytics-page">
        <div class="bg" aria-hidden="true" />
        <layout-header />

        <main class="wrap">
            <div class="page-head">
                <div>
                    <h1>Your stats</h1>
                    <div class="sub">A quiet look at where your focus went.</div>
                </div>
                <button
                    v-if="
                        user &&
                        loaded &&
                        summary.totalSessions > 0 &&
                        can('data_export')
                    "
                    class="btn-export"
                    title="Download your sessions as CSV"
                    @click="exportCsv"
                >
                    <FontAwesomeIcon :icon="['far', 'arrow-down-to-line']" />
                    Export CSV
                </button>
            </div>

            <!-- Logged-out / error / loading / empty -->
            <section v-if="!user" class="card card-pad state">
                <p>Sign in to track your focus stats across devices.</p>
                <ui-button to="/login">Login</ui-button>
            </section>

            <section v-else-if="error" class="card card-pad state">
                <p>{{ error }}</p>
                <ui-button @click="reload">Retry</ui-button>
            </section>

            <section v-else-if="loading && !loaded" class="card card-pad state">
                <p>Loading your stats…</p>
            </section>

            <section
                v-else-if="loaded && summary.totalSessions === 0"
                class="card card-pad state"
            >
                <p>No focus sessions yet — finish a Pomodoro to get started!</p>
                <ui-button to="/">Start a timer</ui-button>
            </section>

            <div v-else class="stack">
                <!-- Hero: streak orb + headline metrics -->
                <section class="card hero">
                    <div class="orb-col">
                        <parts-streak-orb
                            :count="streakStore.currentStreak"
                            :fill="orbFill"
                        />
                        <div class="orb-caption">
                            <template v-if="nextMilestone">
                                <b
                                    >{{ milestoneRemaining }} day{{
                                        milestoneRemaining === 1 ? '' : 's'
                                    }}</b
                                >
                                to {{ nextMilestone.name }} · Longest
                                <b>{{ streakStore.longestStreak }}</b>
                            </template>
                            <template v-else>
                                Longest
                                <b>{{ streakStore.longestStreak }}</b>
                            </template>
                        </div>
                    </div>

                    <div class="metrics">
                        <div class="metric">
                            <div class="label">Total focus</div>
                            <div class="value">
                                <template
                                    v-for="(p, i) in durationParts(
                                        summary.totalFocusMins,
                                    )"
                                    :key="i"
                                    >{{ p.value
                                    }}<span class="u">{{ p.unit }}</span></template
                                >
                            </div>
                            <div class="foot">
                                {{ summary.totalSessions }} sessions all-time
                            </div>
                        </div>

                        <div class="metric">
                            <div class="label">This week</div>
                            <div class="value">
                                <template
                                    v-for="(p, i) in durationParts(
                                        summary.weekFocusMins,
                                    )"
                                    :key="i"
                                    >{{ p.value
                                    }}<span class="u">{{ p.unit }}</span></template
                                >
                            </div>
                            <div class="foot">
                                {{ summary.weekSessions }} session{{
                                    summary.weekSessions === 1 ? '' : 's'
                                }}
                            </div>
                        </div>

                        <div class="metric">
                            <div class="label">Today</div>
                            <div class="value accent">
                                <template
                                    v-for="(p, i) in durationParts(
                                        summary.todayFocusMins,
                                    )"
                                    :key="i"
                                    >{{ p.value
                                    }}<span class="u">{{ p.unit }}</span></template
                                >
                            </div>
                            <div class="foot">
                                {{ summary.todaySessions }} session{{
                                    summary.todaySessions === 1 ? '' : 's'
                                }}
                            </div>
                        </div>

                        <div class="metric">
                            <div class="label">Best day</div>
                            <div class="value">
                                <template v-if="summary.bestDay">
                                    <template
                                        v-for="(p, i) in durationParts(
                                            summary.bestDay.minutes,
                                        )"
                                        :key="i"
                                        >{{ p.value
                                        }}<span class="u">{{
                                            p.unit
                                        }}</span></template
                                    >
                                </template>
                                <template v-else>—</template>
                            </div>
                            <div class="foot">
                                {{
                                    summary.bestDay
                                        ? formatDay(summary.bestDay.day)
                                        : 'No data yet'
                                }}
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Focus over time -->
                <section class="card card-pad">
                    <div class="card-head">
                        <h2>Focus over time</h2>
                        <div class="seg" role="group" aria-label="Range">
                            <button
                                v-for="opt in RANGE_OPTIONS"
                                :key="opt"
                                :class="{
                                    on: range === opt,
                                    locked: rangeLocked(opt),
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
                            </button>
                        </div>
                    </div>
                    <parts-analytics-daily-bar-chart :points="series" />
                </section>

                <!-- Advanced (Pro): heatmap + time of day -->
                <template v-if="can('advanced_stats')">
                    <section class="card card-pad">
                        <div class="card-head">
                            <h2>Activity</h2>
                            <div class="meta">Last {{ HEATMAP_WEEKS }} weeks</div>
                        </div>
                        <parts-analytics-heatmap :points="heatmapPoints" />
                    </section>

                    <section class="card card-pad">
                        <div class="card-head">
                            <h2>Time of day</h2>
                            <div v-if="peakHourLabel" class="meta">
                                Most focused around
                                <b>{{ peakHourLabel }}</b>
                            </div>
                        </div>
                        <parts-analytics-hourly-chart :hours="hourly" />
                    </section>
                </template>

                <section v-else class="card card-pad upsell">
                    <FontAwesomeIcon
                        :icon="['far', 'chart-line']"
                        class="upsell__icon"
                    />
                    <div>
                        <h2>{{ advancedStats.title }}</h2>
                        <p class="upsell__desc">
                            {{ advancedStats.description }} Available with Pro.
                        </p>
                    </div>
                </section>

                <!-- Achievements -->
                <section class="card card-pad">
                    <div class="card-head">
                        <h2>Achievements</h2>
                        <div class="meta">
                            {{ achievementsStore.unlockedCount }} /
                            {{ ACHIEVEMENTS.length }} unlocked
                        </div>
                    </div>
                    <parts-analytics-achievements-timeline />
                </section>
            </div>

            <div class="footer">
                Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js
            </div>
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
import {
    ACHIEVEMENTS,
    STREAK_ACHIEVEMENTS,
} from '~~/constants/achievements';
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

// Never plot more than the user is entitled to. min(n, Infinity) === n.
const series = computed(() =>
    recentSeries(Math.min(range.value, historyDays.value)),
);

// Advanced (Pro) views — history is unlimited for Pro, so the heatmap shows the
// full window regardless of the free `historyDays` cap.
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

// --- Streak orb: fill tracks progress toward the next milestone ---
const nextMilestone = computed(
    () =>
        STREAK_ACHIEVEMENTS.find(
            (a) => a.threshold > streakStore.currentStreak,
        ) ?? null,
);
const milestoneRemaining = computed(() =>
    nextMilestone.value
        ? Math.max(0, nextMilestone.value.threshold - streakStore.currentStreak)
        : 0,
);
const orbFill = computed(() => {
    if (!nextMilestone.value) return 100;
    return (streakStore.currentStreak / nextMilestone.value.threshold) * 100;
});

/** Split minutes into themed value/unit chunks, e.g. 128 → [{2,'h'},{8,'m'}]. */
function durationParts(mins: number): { value: number; unit: string }[] {
    const total = Math.round(mins);
    const h = Math.floor(total / 60);
    const m = total % 60;
    const parts: { value: number; unit: string }[] = [];
    if (h > 0) parts.push({ value: h, unit: 'h' });
    if (m > 0 || h === 0) parts.push({ value: m, unit: 'm' });
    return parts;
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

function reload() {
    void load();
}

onMounted(reload);
// Reload (or clear) whenever auth settles or changes.
watch(user, reload);

// formatMinutes kept imported for parity with child components / future use.
void formatMinutes;

useHead({ title: 'Your stats - Pomodorider' });
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/breakpoints' as *;

.analytics-page {
    position: relative;
    min-height: 100vh;
}

// Ambient themed backdrop, echoing the timer screen.
.bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
            radial-gradient(
                60% 50% at 28% 8%,
                rgba(var(--color-timerBg), 0.1) 0%,
                transparent 60%
            ),
            radial-gradient(
                50% 40% at 85% 4%,
                rgba(var(--color-timerBg), 0.05) 0%,
                transparent 55%
            ),
            #050505;
    }
}

.wrap {
    max-width: rem(1080px);
    margin: 0 auto;
    padding: rem(8px) rem(28px) rem(96px);

    @include respond-to(tablet) {
        padding: rem(8px) rem(16px) rem(64px);
    }
}

.page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $spacing-md;
    margin: rem(20px) 0 rem(28px);

    h1 {
        font-size: 2rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.01em;
    }

    .sub {
        color: $text-secondary;
        font-size: rem(14.4px);
        margin-top: 6px;
    }
}

.btn-export {
    display: inline-flex;
    align-items: center;
    gap: rem(8px);
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: rem(14.4px);
    padding: rem(11px) rem(18px);
    border-radius: $radius-full;
    background: $button-background-color;
    color: $text-color;
    box-shadow: $shadow-sm;
    transition:
        transform $transition-fast,
        background $transition-fast;

    &:hover {
        transform: translateY(-1px);
        background: #444444;
    }
}

// ---------------- Glass card ----------------
.card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #1b1b1b 0%, #151515 100%);
    border-radius: 20px;
    outline: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow:
        rgba(0, 0, 0, 0.45) 0 24px 48px -16px,
        rgba(0, 0, 0, 0.3) 0 8px 20px -8px,
        inset 0 1px 0 rgba(255, 255, 255, 0.04);

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(
            70% 60% at 50% -10%,
            rgba(var(--color-timerBg), 0.06) 0%,
            transparent 70%
        );
    }
}

.card-pad {
    padding: rem(28px) rem(30px);
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    margin-bottom: rem(22px);
    position: relative;

    h2 {
        font-size: rem(18.4px);
        font-weight: 700;
        margin: 0;
    }

    .meta {
        font-size: rem(13.6px);
        color: $text-secondary;

        b {
            color: $text-color;
            font-weight: 600;
        }
    }
}

.stack {
    display: flex;
    flex-direction: column;
    gap: rem(22px);
}

.state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
    color: $text-secondary;
}

// ---------------- Hero ----------------
.hero {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: rem(40px);
    align-items: center;
    padding: rem(34px) rem(38px);

    @include respond-to(tablet) {
        grid-template-columns: 1fr;
        gap: rem(28px);
        text-align: center;
        padding: rem(28px) rem(22px);
    }
}

.orb-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(16px);
}

.orb-caption {
    font-size: rem(13px);
    color: $text-secondary;

    b {
        color: $text-color;
        font-weight: 600;
    }
}

.metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px rem(36px);

    @include respond-to(tablet) {
        gap: rem(22px);
    }
}

.metric {
    padding: rem(14px) 0;
    position: relative;

    .label {
        font-size: rem(11.5px);
        letter-spacing: 1.4px;
        text-transform: uppercase;
        color: $text-secondary;
        margin-bottom: 8px;
    }

    .value {
        font-size: rem(35px);
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.02em;

        .u {
            font-size: rem(20.8px);
            font-weight: 700;
            color: $text-secondary;
            margin-left: 1px;
        }

        &.accent {
            color: rgb(var(--color-timerBg));
        }
    }

    .foot {
        font-size: rem(12.8px);
        color: $text-secondary;
        margin-top: 8px;
    }
}

// Hairline grid between the four metrics (above the tablet breakpoint).
@media (min-width: 769px) {
    .metrics .metric:nth-child(-n + 2) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .metrics .metric:nth-child(odd) {
        padding-right: 28px;
    }
    .metrics .metric:nth-child(even) {
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        padding-left: 28px;
    }
}

// ---------------- Toggle (7d/30d) ----------------
.seg {
    display: inline-flex;
    padding: 3px;
    gap: 3px;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.05);

    button {
        border: 0;
        cursor: pointer;
        font-family: inherit;
        font-size: rem(12.8px);
        font-weight: 600;
        padding: rem(6px) rem(14px);
        border-radius: $radius-full;
        color: $text-secondary;
        background: transparent;
        transition: color $transition-fast;

        &.on {
            color: #1a1206;
            background: linear-gradient(
                180deg,
                rgb(var(--color-timerBg)),
                rgba(var(--color-timerBg), 0.82)
            );
            box-shadow: 0 0 16px rgba(var(--color-timerBg), 0.3);
        }

        &.locked {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}

// ---------------- Upsell ----------------
.upsell {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $spacing-md;

    &__icon {
        font-size: rem(22px);
        color: rgb(var(--color-timerBg));
        flex-shrink: 0;
    }

    h2 {
        font-size: rem(16px);
        font-weight: 700;
        margin: 0;
    }

    &__desc {
        font-size: rem(13.6px);
        color: $text-secondary;
        margin-top: 4px;
    }
}

.footer {
    text-align: center;
    color: $text-secondary;
    font-size: rem(13.6px);
    padding: rem(36px) 0 rem(8px);
}
</style>
