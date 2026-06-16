<template>
    <div class="pomodoro-app">
        <layout-header />

        <main class="app-main">
            <PickList
                @open-settings="settingsOpen = true"
                @open-achievements="achievementsOpen = true"
            />
            <TimerDisplay />
        </main>

        <section class="seo-content" aria-labelledby="seo-heading">
            <h1 id="seo-heading">Free Online Pomodoro Timer</h1>
            <p>
                Pomodorider is a free, distraction-free Pomodoro timer that
                helps you focus, beat procrastination, and get more done. Pick a
                cozy theme, choose an ambient sound, and start a 25-minute focus
                session right in your browser — no download or signup needed.
            </p>

            <h2>How the Pomodoro Technique works</h2>
            <ol>
                <li>Choose a task you want to focus on.</li>
                <li>
                    Start the timer and work for 25 minutes — one "pomodoro."
                </li>
                <li>Take a short 5-minute break when the timer rings.</li>
                <li>
                    After four pomodoros, take a longer 15–30 minute break to
                    recharge.
                </li>
            </ol>

            <h2>Why use Pomodorider?</h2>
            <ul>
                <li>
                    <strong>Cozy themes &amp; ambient sounds</strong> — rain,
                    coffee shop, ticking clock and more to set your focus mood.
                </li>
                <li>
                    <strong>Focus streaks &amp; achievements</strong> — build a
                    daily habit and stay motivated.
                </li>
                <li>
                    <strong>Focus analytics</strong> — see your most productive
                    hours and track progress over time.
                </li>
                <li>
                    <strong>Works everywhere</strong> — the timer keeps running
                    in the background, even across browser tabs.
                </li>
            </ul>

            <h2>Frequently asked questions</h2>
            <div class="seo-faq">
                <details v-for="(faq, i) in faqs" :key="i">
                    <summary>{{ faq.q }}</summary>
                    <p>{{ faq.a }}</p>
                </details>
            </div>
        </section>

        <footer class="app-footer">
            <p>Built with Nuxt.js, Pinia, SCSS, VueUse, and Howler.js</p>
            <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        </footer>

        <SettingsPanel :is-open="settingsOpen" @close="settingsOpen = false" />
        <parts-achievements-modal
            :is-open="achievementsOpen"
            @close="achievementsOpen = false"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    useHead,
    useSeoMeta,
    useSchemaOrg,
    defineWebSite,
    defineSoftwareApp,
} from '#imports';
import { useTimerStore } from '~~/stores/timer';
import { useDocumentVisibility, usePageLeave } from '@vueuse/core';

const timerStore = useTimerStore();
const settingsOpen = ref(false);
const achievementsOpen = ref(false);

// Dynamic page title with timer. When idle, the title carries the primary
// keyword phrase so the homepage reads well in search results; while running,
// the countdown takes over for the browser-tab UX.
const pageTitle = computed(() => {
    if (timerStore.isRunning || timerStore.isPaused) {
        return `${timerStore.formattedTime} - Pomodorider`;
    }
    return 'Pomodorider — Free Online Pomodoro Timer';
});

useHead({
    title: pageTitle,
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

// Auto-generated branded social-share image (nuxt-og-image, bundled with
// @nuxtjs/seo). Renders a 1200×630 card from the built-in template.
defineOgImage('NuxtSeo', {
    title: 'Pomodorider',
    description: 'Free online Pomodoro timer',
    theme: '#e07a5f',
});

// Frequently-asked questions — rendered on the page AND emitted as FAQPage
// structured data so Google can show them directly in search results.
const faqs = [
    {
        q: 'What is the Pomodoro Technique?',
        a: 'The Pomodoro Technique is a time-management method that breaks work into focused 25-minute intervals (called "pomodoros") separated by short 5-minute breaks. After four pomodoros you take a longer 15–30 minute break. It helps you beat procrastination and stay focused.',
    },
    {
        q: 'Is Pomodorider free to use?',
        a: 'Yes. Pomodorider is a free online Pomodoro timer you can use right in your browser with no signup required. An optional Pro plan unlocks extra themes and advanced focus analytics.',
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

// Structured data so Google can surface a rich result for the app.
useSchemaOrg([
    defineWebSite({
        name: 'Pomodorider',
        description,
    }),
    defineSoftwareApp({
        name: 'Pomodorider',
        description,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
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

// Use VueUse composables for enhanced functionality
const visibility = useDocumentVisibility();
const isLeavingPage = usePageLeave();

watch(visibility, (current) => {
    if (current === 'visible' && timerStore.isRunning) {
        // Timer continues running in the background
    }
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/breakpoints' as *;

.pomodoro-app {
    display: flex;
    flex-direction: column;

    .app-main {
        display: flex;
    }
}

.seo-content {
    max-width: 720px;
    margin: 12rem auto 0;
    padding: $spacing-lg;
    color: $text-secondary;
    line-height: 1.65;

    h1 {
        font-size: 1.75rem;
        color: $text-color;
        margin-bottom: $spacing-md;
    }

    h2 {
        font-size: 1.25rem;
        color: $text-color;
        margin: $spacing-lg 0 $spacing-sm;
    }

    p,
    ul,
    ol {
        margin-bottom: $spacing-sm;
    }

    ul,
    ol {
        padding-left: $spacing-lg;

        li {
            margin-bottom: $spacing-xs;
        }
    }

    .seo-faq {
        details {
            border-top: 1px solid rgba($text-secondary, 0.2);
            padding: $spacing-sm 0;

            summary {
                cursor: pointer;
                font-weight: 600;
                color: $text-color;
            }

            p {
                margin-top: $spacing-sm;
            }
        }
    }
}

.app-footer {
    font-size: 0.9rem;
    text-align: center;
    padding: $spacing-lg;
    color: $text-secondary;

    a {
        color: $text-secondary;
    }
}

@include respond-to(tablet) {
    .pomodoro-app .app-main {
        flex-direction: column;
    }

    .app-header {
        h1 {
            font-size: 2rem;
        }

        .subtitle {
            font-size: 1rem;
        }
    }
}
</style>
