<template>
    <div class="analytics-page">
        <div class="bg" aria-hidden="true" />
        <layout-header />

        <main class="wrap">
            <div class="page-head">
                <div>
                    <h1>Your stats</h1>
                    <div class="sub">
                        A quiet look at where your focus went.
                    </div>
                </div>
                <button
                    v-if="user && loaded && summary.totalSessions > 0"
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
                                    }}<span class="u">{{
                                        p.unit
                                    }}</span></template
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
                                    }}<span class="u">{{
                                        p.unit
                                    }}</span></template
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
                                    }}<span class="u">{{
                                        p.unit
                                    }}</span></template
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
                                :class="{ on: range === opt }"
                                @click="selectRange(opt)"
                            >
                                {{ opt }}d
                            </button>
                        </div>
                    </div>
                    <parts-analytics-daily-bar-chart :points="series" />
                </section>

                <!-- Activity heatmap + time of day -->
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
import { useStreakStore } from '~~/stores/streak';
import { useAchievementsStore } from '~~/stores/achievements';
import { ACHIEVEMENTS, STREAK_ACHIEVEMENTS } from '~~/constants/achievements';

const user = useSupabaseUser();
const streakStore = useStreakStore();
const achievementsStore = useAchievementsStore();
const {
    summary,
    hourly,
    loading,
    loaded,
    error,
    load,
    recentSeries,
    exportCsv,
} = useAnalytics();

const RANGE_OPTIONS = [7, 30] as const;
const range = ref<number>(7);

function selectRange(days: number) {
    range.value = days;
}

const series = computed(() => recentSeries(range.value));

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
@use '@@/app/assets/styles/pages/_analytics.scss';
</style>
