// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    devServer: {
        port: 3001,
    },

    runtimeConfig: {
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        public: {
            stripePublishableKey:
                process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3001',
            stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY,
            stripePriceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY,
            // mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL,
        },
    },

    modules: [
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxtjs/supabase',
        '@vercel/speed-insights/nuxt',
    ],

    supabase: {
        redirect: false,
    },

    css: [
        // Font Awesome's base styles. The fontawesome plugin sets
        // `config.autoAddCss = false`, so we must include this ourselves or
        // icons render unstyled / flash oversized (FOUC) before hydration.
        '@fortawesome/fontawesome-svg-core/styles.css',
        '~/assets/styles/main.scss',
        '~/assets/styles/_fonts.scss',
    ],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        @use "~/assets/styles/abstracts/index.scss" as *;
                        @use "~/assets/styles/utils/_index.scss" as *;
                    `,
                },
            },
        },
    },
});
