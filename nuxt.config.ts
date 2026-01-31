// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },

    modules: ['@pinia/nuxt', '@vueuse/nuxt'],

    css: ['~/assets/styles/main.scss'],

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
