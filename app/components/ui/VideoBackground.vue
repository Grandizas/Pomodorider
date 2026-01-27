<template>
    <div class="bg">
        <video
            id="bgVideo"
            class="bg__video"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
        >
            <source src="@/assets/videos/Ocean.mp4" type="video/mp4" />
        </video>

        <!-- Optional: dark overlay to improve text contrast -->
        <div class="bg__overlay"></div>
    </div>
</template>

<script setup lang="ts"></script>

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
    width: 80%;
    height: 80%;
    object-fit: cover;
    position: absolute;
    border-radius: 2rem;
    transform: translate(-50%, -50%);
}

.bg__overlay {
    inset: 0;
    position: absolute;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.2);
}
</style>
