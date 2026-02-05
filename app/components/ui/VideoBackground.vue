<template>
    <div class="bg">
        <video
            ref="videoRef"
            class="bg__video"
            :class="{ fullscreen: isFullscreen }"
            :src="videoSrc"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
        ></video>

        <!-- Optional: dark overlay to improve text contrast -->
        <div class="bg__overlay"></div>
    </div>
</template>

<script setup lang="ts">
import { useThemeVideo } from '~/composables/useThemeVideo';

defineProps<{
    isFullscreen: boolean;
}>();

const videoSrc = useThemeVideo();
const videoRef = ref<HTMLVideoElement | null>(null);

watch(videoSrc, () => {
    const video = videoRef.value;
    if (!video) {
        return;
    }

    video.load();
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/_video-background.scss';
</style>
