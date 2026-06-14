import { defineNuxtPlugin } from '#app';
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import specific icons
import {
    faUser,
    faFire,
    faBolt,
    faLock,
    faCalendarRange,
    faRocketLaunch,
} from '@fortawesome/pro-solid-svg-icons';
import {
    faEye,
    faPlay,
    faXmark,
    faPause,
    faForward,
    faTrophyStar,
    faArrowLeft,
    faEnvelope,
    faChevronLeft,
    faChevronDown,
    faGearComplex,
    faVolumeHigh,
    faVolumeXmark,
    faArrowRotateLeft,
    faShieldKeyhole,
} from '@fortawesome/pro-regular-svg-icons';

// Prevent auto-adding CSS since Nuxt handles it
config.autoAddCss = false;

library.add(
    faUser,
    faFire,
    faEye,
    faLock,
    faBolt,
    faPlay,
    faXmark,
    faPause,
    faCalendarRange,
    faForward,
    faRocketLaunch,
    faChevronLeft,
    faChevronDown,
    faGearComplex,
    faVolumeHigh,
    faVolumeXmark,
    faArrowRotateLeft,
    faTrophyStar,
    faArrowLeft,
    faEnvelope,
    faShieldKeyhole,
);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
