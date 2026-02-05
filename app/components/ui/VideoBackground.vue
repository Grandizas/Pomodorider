<template>
    <div class="bg">
        <img class="bg__poster" :src="thumbnailSrc" alt="" />

        <video
            ref="videoRef"
            class="bg__video"
            :class="[{ fullscreen: isFullscreen }, { 'is-ready': isReady }]"
            :src="videoSrc"
            :poster="thumbnailSrc"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            @loadeddata="onLoaded"
            @error="onError"
        />

        <!-- Optional: dark overlay to improve text contrast -->
        <div class="bg__overlay"></div>
    </div>
</template>

<script setup lang="ts">
import { useThemeVideo } from '~/composables/useThemeVideo';
import { useThemeThumbnail } from '~/composables/useThemeThumbnail';

defineProps<{
    isFullscreen: boolean;
}>();

const videoSrc = useThemeVideo();
const thumbnailSrc = useThemeThumbnail();

const isReady = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);

watch(videoSrc, async () => {
    isReady.value = false;
    const v = videoRef.value;
    if (!v) return;

    // helps on some browsers to start buffering immediately after src change
    v.load();
    try {
        await v.play();
    } catch {}
});

function onLoaded() {
    isReady.value = true;
}

function onError() {
    isReady.value = false;
}
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/_video-background.scss';
</style>
