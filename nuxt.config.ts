// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    devServer: {
        port: 3001,
    },

    runtimeConfig: {
        public: {
            mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL,
        },
    },

    modules: ['@pinia/nuxt', '@vueuse/nuxt'],

    css: ['~/assets/styles/main.scss', '~/assets/styles/_fonts.scss'],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData:
                        '@use "~/assets/styles/_variables.scss" as *;' +
                        '@use "~/assets/styles/_functions.scss" as *;',
                },
            },
        },
    },
});
