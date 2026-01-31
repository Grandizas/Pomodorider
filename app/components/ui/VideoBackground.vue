<template>
    <div class="bg">
        <video
            :key="videoSrc"
            class="bg__video"
            :class="{ fullscreen: isFullscreen }"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
        >
            <source :src="videoSrc" type="video/mp4" />
        </video>

        <!-- Optional: dark overlay to improve text contrast -->
        <div class="bg__overlay"></div>
    </div>
</template>

<script setup lang="ts">
import { themes } from '~~/themes/themes';
import { useThemeStore } from '~~/stores/theme';

defineProps<{
    isFullscreen: boolean;
}>();

const themeStore = useThemeStore();

const videos = import.meta.glob('@/assets/videos/*', {
    eager: true,
    as: 'url',
});

const videoSrc = computed(() => {
    const file = themes[themeStore.activeTheme].video;
    return videos[`/assets/videos/${file}`];
});

const bgVideoEl = ref<HTMLVideoElement | null>(null);

watch(videoSrc, async () => {
    await nextTick();
    const el = bgVideoEl.value;
    if (!el) return;

    el.load();
    // optional: if autoplay ever gets blocked in some cases
    el.play().catch(() => {});
});
</script>

<style scoped>
.bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
}

.bg__video {
    inset: 0;
    top: 50%;
    left: 50%;
    object-fit: cover;
    position: absolute;
    transform: translate(-50%, -50%);

    &.fullscreen {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }

    &:not(.fullscreen) {
        width: 80%;
        height: 80%;
        border-radius: 2rem;
    }
}

.bg__overlay {
    inset: 0;
    position: absolute;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.2);
}
</style>
