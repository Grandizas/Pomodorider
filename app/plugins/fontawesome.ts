import { defineNuxtPlugin } from '#app';
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import specific icons
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import {
    faEye,
    faArrowLeft,
    faEnvelope,
    faShieldKeyhole,
} from '@fortawesome/pro-regular-svg-icons';

// Prevent auto-adding CSS since Nuxt handles it
config.autoAddCss = false;

library.add(faUser, faEye, faArrowLeft, faEnvelope, faShieldKeyhole);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
