<template>
    <div class="landing" :style="{ '--accent-rgb': accentRgb }">
        <!-- ----------------- [ Nav ] ----------------- -->
        <header class="lnav">
            <a href="#top" class="lnav__brand">
                <img src="/images/logo.svg" alt="Pomodorider" />
                <span>Pomodorider</span>
            </a>
            <nav class="lnav__links">
                <a href="#themes">Themes</a>
                <a href="#how">How it works</a>
                <a href="#features">Features</a>
                <NuxtLink :to="user ? '/app' : '/login'" class="lnav__cta">{{
                    user ? 'Open app' : 'Login'
                }}</NuxtLink>
            </nav>
        </header>

        <!-- ----------------- [ Hero ] ----------------- -->
        <section id="top" class="hero">
            <div class="hero__glow" aria-hidden="true" />
            <div class="hero__grid">
                <!-- Copy -->
                <div class="hero__copy">
                    <div class="pill">
                        <span class="dot-mark" />
                        A cozy Pomodoro timer
                    </div>
                    <h1 class="hero__title">
                        Focus, one<br />glowing orb<br />at a time.
                    </h1>
                    <p class="hero__lead">
                        Set a rhythm of work and rest. Pick a mood, press play,
                        and watch the liquid rise as your session fills. No
                        noise, no clutter — just quiet, unhurried focus.
                    </p>
                    <div class="hero__ctas">
                        <NuxtLink to="/app" class="btn-primary"
                            >Start focusing</NuxtLink
                        >
                        <a href="#how" class="btn-secondary"
                            >See how it works</a
                        >
                    </div>
                    <div class="hero__kbd">
                        <span><kbd>Space</kbd> Start / Pause</span>
                        <span class="sep">·</span>
                        <span><kbd>R</kbd> Reset</span>
                    </div>
                </div>

                <!-- Interactive demo console -->
                <div class="console">
                    <div class="console__mode">
                        <span class="dot-mark" />
                        {{ modeLabel }}
                    </div>

                    <!-- Orb -->
                    <div class="orb">
                        <div class="orb__halo" aria-hidden="true" />
                        <div class="orb__sphere">
                            <div
                                class="orb__liquid"
                                aria-hidden="true"
                                :style="{ height: fillPct + '%' }"
                            />
                            <div class="orb__time">{{ timeLabel }}</div>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div class="console__controls">
                        <button
                            class="ctrl"
                            title="Reset"
                            aria-label="Reset"
                            @click="resetTimer"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>

                        <button
                            class="ctrl ctrl--play"
                            title="Start / Pause"
                            aria-label="Start or pause"
                            @click="toggle"
                        >
                            <svg
                                v-if="running"
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <rect
                                    x="6"
                                    y="5"
                                    width="4"
                                    height="14"
                                    rx="1"
                                />
                                <rect
                                    x="14"
                                    y="5"
                                    width="4"
                                    height="14"
                                    rx="1"
                                />
                            </svg>
                            <svg
                                v-else
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z"
                                />
                            </svg>
                        </button>

                        <button
                            class="ctrl"
                            title="Skip session"
                            aria-label="Skip session"
                            @click="skip"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M5 5.5v13a1 1 0 0 0 1.5.87L15 14v4.5a1 1 0 0 0 2 0v-13a1 1 0 0 0-2 0V10L6.5 4.63A1 1 0 0 0 5 5.5Z"
                                />
                            </svg>
                        </button>
                    </div>

                    <!-- Theme dots -->
                    <div class="console__dots">
                        <button
                            v-for="key in themeOrder"
                            :key="key"
                            class="dot"
                            :class="{ 'dot--active': demoTheme === key }"
                            :style="{ '--dot-rgb': themeRgb(key) }"
                            :title="key"
                            :aria-label="`${key} theme`"
                            @click="pickTheme(key)"
                        />
                    </div>

                    <!-- Stats -->
                    <div class="console__stats">
                        <div class="stat">
                            <div class="stat__value">{{ sessions }}</div>
                            <div class="stat__label">Sessions</div>
                        </div>
                        <div class="stat">
                            <div class="stat__value">{{ totalLabel }}</div>
                            <div class="stat__label">Total Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ----------------- [ Themes ] ----------------- -->
        <section id="themes" class="section">
            <div class="section__wrap">
                <div class="section__head">
                    <div class="eyebrow">Themes</div>
                    <h2 class="section__title">Set the mood.</h2>
                    <p class="section__lead">
                        Four quiet color moods, each with its own glow. Tap a
                        dot on the orb to switch — the whole scene shifts to
                        match.
                    </p>
                </div>
                <div class="theme-cards">
                    <div
                        v-for="card in themeCards"
                        :key="card.key"
                        class="theme-card"
                    >
                        <div
                            class="theme-card__orb"
                            :style="{ '--c': themeRgb(card.key) }"
                        />
                        <div class="theme-card__meta">
                            <div class="theme-card__name">{{ card.name }}</div>
                            <div class="theme-card__note">{{ card.note }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ----------------- [ How it works ] ----------------- -->
        <section id="how" class="section">
            <div class="section__wrap">
                <div class="section__head">
                    <div class="eyebrow">How it works</div>
                    <h2 class="section__title">Focus. Break. Repeat.</h2>
                    <p class="section__lead">
                        The Pomodoro rhythm, kept simple. Work in focused
                        stretches, rest between them, and take a longer breather
                        after four rounds.
                    </p>
                </div>
                <div class="steps">
                    <div v-for="step in steps" :key="step.n" class="step">
                        <div class="step__n">{{ step.n }}</div>
                        <div class="step__big">
                            {{ step.mins }}<span class="step__unit">min</span>
                        </div>
                        <div class="step__title">{{ step.title }}</div>
                        <p class="step__body">{{ step.body }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ----------------- [ Features ] ----------------- -->
        <section id="features" class="section">
            <div class="section__wrap">
                <div class="section__head">
                    <div class="eyebrow">Features</div>
                    <h2 class="section__title">
                        Everything you need. Nothing you don't.
                    </h2>
                </div>
                <div class="feature-grid">
                    <div v-for="f in features" :key="f.title" class="feature">
                        <div class="feature__icon" v-html="f.icon" />
                        <div class="feature__title">{{ f.title }}</div>
                        <p class="feature__body">{{ f.body }}</p>
                    </div>
                </div>

                <div class="kbd-strip">
                    <div class="kbd-strip__label">Keyboard-first, always.</div>
                    <div class="kbd-strip__keys">
                        <span><kbd>Space</kbd> Start / Pause</span>
                        <span><kbd>R</kbd> Reset</span>
                        <span><kbd>S</kbd> Skip session</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ----------------- [ FAQ ] ----------------- -->
        <section id="faq" class="section">
            <div class="section__wrap section__wrap--narrow">
                <div class="section__head">
                    <div class="eyebrow">FAQ</div>
                    <h2 class="section__title">Good to know.</h2>
                </div>
                <div class="faq">
                    <details v-for="(faq, i) in faqs" :key="i">
                        <summary>{{ faq.q }}</summary>
                        <p>{{ faq.a }}</p>
                    </details>
                </div>
            </div>
        </section>

        <!-- ----------------- [ CTA ] ----------------- -->
        <section class="cta-band">
            <div class="cta-band__glow" aria-hidden="true" />
            <div class="cta-band__inner">
                <h2>Ready for a calmer kind of focus?</h2>
                <p>
                    No account required. Open it, pick a mood, and press play.
                </p>
                <NuxtLink to="/app" class="btn-primary"
                    >Start focusing</NuxtLink
                >
            </div>
        </section>

        <!-- ----------------- [ Footer ] ----------------- -->
        <footer class="lfooter">
            <div class="lfooter__row">
                <div class="lfooter__brand">
                    <img src="/images/logo.svg" alt="Pomodorider" />
                    <span>Pomodorider</span>
                </div>
                <nav class="lfooter__links">
                    <a href="#themes">Themes</a>
                    <a href="#how">How it works</a>
                    <a href="#features">Features</a>
                    <NuxtLink to="/privacy">Privacy</NuxtLink>
                </nav>
            </div>
            <div class="lfooter__built">
                Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
    useHead,
    useSeoMeta,
    useSchemaOrg,
    defineWebSite,
    defineSoftwareApp,
} from '#imports';
import { themes, type ThemeKey } from '~~/themes/themes';

const user = useSupabaseUser();

// ---------------------------------------------------------------------------
// Standalone demo timer. Deliberately self-contained — it does NOT touch the
// real timer store, so playing with it here never affects a running session in
// the actual app. Mirrors the store's rhythm (25 / 5 / 15, long break every 4).
// ---------------------------------------------------------------------------
type DemoMode = 'work' | 'short' | 'long';
const durations: Record<DemoMode, number> = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};
const themeOrder = Object.keys(themes) as ThemeKey[]; // white, red, blue, yellow

const demoTheme = ref<ThemeKey>('white');
const mode = ref<DemoMode>('work');
const secondsLeft = ref(durations.work);
const running = ref(false);
const sessions = ref(0);
const totalFocus = ref(0);
const round = ref(0);

let ticker: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
    ticker = setInterval(() => {
        if (!running.value) return;
        if (secondsLeft.value <= 1) {
            advance(true);
            return;
        }
        secondsLeft.value -= 1;
    }, 1000);
});
onBeforeUnmount(() => {
    if (ticker) clearInterval(ticker);
});

function advance(completed: boolean) {
    if (mode.value === 'work') {
        if (completed) {
            sessions.value += 1;
            totalFocus.value += durations.work;
        }
        round.value += 1;
        mode.value = round.value % 4 === 0 ? 'long' : 'short';
    } else {
        mode.value = 'work';
    }
    secondsLeft.value = durations[mode.value];
    running.value = false;
}

const toggle = () => {
    running.value = !running.value;
};
const resetTimer = () => {
    secondsLeft.value = durations[mode.value];
    running.value = false;
};
const skip = () => advance(false);
const pickTheme = (t: ThemeKey) => {
    demoTheme.value = t;
};

const themeRgb = (key: ThemeKey) => themes[key].colors.timerBg;
const accentRgb = computed(() => themeRgb(demoTheme.value));

const fillPct = computed(() => {
    const total = durations[mode.value];
    return Math.max(0, Math.min(100, (1 - secondsLeft.value / total) * 100));
});

const pad = (n: number) => String(n).padStart(2, '0');
const timeLabel = computed(
    () =>
        `${pad(Math.floor(secondsLeft.value / 60))}:${pad(secondsLeft.value % 60)}`,
);
const modeLabel = computed(
    () =>
        ({ work: 'Focus session', short: 'Short break', long: 'Long break' })[
            mode.value
        ],
);
const totalLabel = computed(() => {
    const m = Math.floor(totalFocus.value / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
});

// ---------------------------------------------------------------------------
// Static section content
// ---------------------------------------------------------------------------
const themeCards = [
    { key: 'white' as ThemeKey, name: 'White', note: 'Clean & default' },
    { key: 'red' as ThemeKey, name: 'Red', note: 'Dusty rose' },
    { key: 'blue' as ThemeKey, name: 'Blue', note: 'Muted sky' },
    { key: 'yellow' as ThemeKey, name: 'Yellow', note: 'Warm brass' },
];

const steps = [
    {
        n: '01',
        mins: 25,
        title: 'Focus',
        body: 'One clear task, one full session. The orb fills as you go.',
    },
    {
        n: '02',
        mins: 5,
        title: 'Short break',
        body: 'Step away, stretch, breathe. Then slide back in.',
    },
    {
        n: '03',
        mins: 15,
        title: 'Long break',
        body: 'After four rounds, a longer rest to reset for the next.',
    },
];

const icon = (paths: string, filled = false) =>
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="${
        filled ? 'currentColor' : 'none'
    }" stroke="${
        filled ? 'none' : 'currentColor'
    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const features = [
    {
        title: 'A themeable orb',
        body: 'One glowing sphere that fills as you focus. Four moods to match your desk, your light, your day.',
        icon: icon('<circle cx="12" cy="12" r="9" />'),
    },
    {
        title: 'Ambient & custom sounds',
        body: 'Gentle cues for start and finish — coffee pouring, a soft clock, a cat purr. Or upload your own.',
        icon: icon(
            '<path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" />',
        ),
    },
    {
        title: 'Focus stats',
        body: 'Sessions and total focus time, tracked quietly in the background, with streaks and achievements.',
        icon: icon('<path d="M4 20V10 M10 20V4 M16 20v-6 M22 20H2" />'),
    },
    {
        title: 'Distraction-free',
        body: 'No feeds, no badges, no popups. A single screen built to disappear while you work.',
        icon: icon('<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />'),
    },
    {
        title: 'Auto-start rounds',
        body: 'Flow straight from focus to break and back, hands-off, if you want the rhythm to keep itself.',
        icon: icon(
            '<path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />',
        ),
    },
    {
        title: 'Yours, privately',
        body: 'Works right in your browser, no sign-in needed. Log in only to sync streaks and stats across devices.',
        icon: icon(
            '<path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" />',
        ),
    },
];

// ---------------------------------------------------------------------------
// SEO — the landing is the front door, so the keyword-rich meta + structured
// data (WebSite / SoftwareApp / FAQPage) live here.
// ---------------------------------------------------------------------------
useHead({
    title: 'Pomodorider — Free Online Pomodoro Timer',
    htmlAttrs: { lang: 'en' },
});

const description =
    'A free online Pomodoro timer with cozy themes, ambient sounds, focus streaks, and analytics. Boost productivity with the Pomodoro Technique — no signup required.';

useSeoMeta({
    description,
    ogType: 'website',
    ogSiteName: 'Pomodorider',
    ogTitle: 'Pomodorider — Free Online Pomodoro Timer',
    ogDescription: description,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Pomodorider — Free Online Pomodoro Timer',
    twitterDescription: description,
});

defineOgImage('Default', {
    title: 'Pomodorider',
    description: 'Free online Pomodoro timer',
});

const faqs = [
    {
        q: 'What is the Pomodoro Technique?',
        a: 'The Pomodoro Technique is a time-management method that breaks work into focused 25-minute intervals (called "pomodoros") separated by short 5-minute breaks. After four pomodoros you take a longer 15–30 minute break. It helps you beat procrastination and stay focused.',
    },
    {
        q: 'Is Pomodorider free to use?',
        a: 'Yes. Pomodorider is a completely free online Pomodoro timer you can use right in your browser with no signup required. Every feature — custom themes, focus streaks, achievements, and advanced analytics — is free, with no paid plans.',
    },
    {
        q: 'Do I need to create an account?',
        a: 'No account is needed to use the timer. Signing in is only required if you want to save focus streaks, achievements, and long-term analytics across devices.',
    },
    {
        q: 'How long should a Pomodoro timer be set for?',
        a: 'The classic setting is 25 minutes of focused work followed by a 5-minute break. Pomodorider lets you customize these durations to fit your own focus rhythm.',
    },
    {
        q: 'Does the timer keep running if I switch tabs?',
        a: 'Yes. The timer keeps counting in the background when you switch tabs or minimize the window, and an alarm sounds when your session ends.',
    },
];

useSchemaOrg([
    defineWebSite({ name: 'Pomodorider', description }),
    defineSoftwareApp({
        name: 'Pomodorider',
        description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
    {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    },
]);
</script>

<!-- Site-wide smooth scrolling for the in-page anchor nav. -->
<style>
html {
    scroll-behavior: smooth;
}
</style>

<style scoped lang="scss">
@use '@@/app/assets/styles/pages/_index.scss';
</style>
