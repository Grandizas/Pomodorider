import { defineNuxtPlugin } from '#app';
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Import specific icons
// Solid (fas) — used by the streak badge and the achievement unlock toast.
import {
    faUser,
    faFire as fasFire,
    faBolt as fasBolt,
    faCalendarRange as fasCalendarRange,
    faRocketLaunch as fasRocketLaunch,
    faTrophyStar as fasTrophyStar,
} from '@fortawesome/pro-solid-svg-icons';
// Regular (far) — used everywhere else, incl. the achievements modal gallery.
import {
    faEye,
    faPlay,
    faXmark,
    faPause,
    faForward,
    faLock,
    faFire as farFire,
    faBolt as farBolt,
    faCalendarRange as farCalendarRange,
    faRocketLaunch as farRocketLaunch,
    faTrophyStar as farTrophyStar,
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
    faEye,
    faLock,
    faPlay,
    faXmark,
    faPause,
    faForward,
    faChevronLeft,
    faChevronDown,
    faGearComplex,
    faVolumeHigh,
    faVolumeXmark,
    faArrowRotateLeft,
    faArrowLeft,
    faEnvelope,
    faShieldKeyhole,
    // Achievement icons — registered in both styles (solid toast / regular modal).
    fasFire,
    farFire,
    fasBolt,
    farBolt,
    fasCalendarRange,
    farCalendarRange,
    fasRocketLaunch,
    farRocketLaunch,
    fasTrophyStar,
    farTrophyStar,
);

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon);
});
