import { defineNuxtPlugin } from '#app';
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import specific icons
import { faUser, faFire } from '@fortawesome/pro-solid-svg-icons';
import {
    faEye,
    faTrophyStar,
    faArrowLeft,
    faEnvelope,
    faShieldKeyhole,
} from '@fortawesome/pro-regular-svg-icons';

// Prevent auto-adding CSS since Nuxt handles it
config.autoAddCss = false;

library.add(
    faUser,
    faFire,
    faEye,
    faTrophyStar,
    faArrowLeft,
    faEnvelope,
    faShieldKeyhole,
);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
