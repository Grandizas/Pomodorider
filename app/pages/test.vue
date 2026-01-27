<template>
    <div class="wave-wrap">
        <svg
            class="wave-svg"
            viewBox="0 0 1440 420"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <!-- Background -->
            <rect width="1440" height="420" fill="#6EA8FF" />

            <!-- Layer 1 (far) -->
            <g class="layer layer-1">
                <path
                    fill="#4E8CFF"
                    d="M0,180 C180,220 360,140 540,180 C720,220 900,140 1080,180 C1260,220 1440,160 1440,160 L1440,420 L0,420 Z"
                />
                <!-- duplicate to avoid gaps while moving -->
                <path
                    fill="#4E8CFF"
                    transform="translate(1440,0)"
                    d="M0,180 C180,220 360,140 540,180 C720,220 900,140 1080,180 C1260,220 1440,160 1440,160 L1440,420 L0,420 Z"
                />
            </g>

            <!-- Layer 2 -->
            <g class="layer layer-2">
                <path
                    fill="#1F73FF"
                    d="M0,230 C200,300 380,190 560,230 C740,270 920,170 1100,230 C1280,290 1440,220 1440,220 L1440,420 L0,420 Z"
                />
                <path
                    fill="#1F73FF"
                    transform="translate(1440,0)"
                    d="M0,230 C200,300 380,190 560,230 C740,270 920,170 1100,230 C1280,290 1440,220 1440,220 L1440,420 L0,420 Z"
                />
            </g>

            <!-- Layer 3 (near) -->
            <g class="layer layer-3">
                <path
                    fill="#0B57D0"
                    d="M0,300 C220,360 420,250 620,300 C820,350 980,270 1160,300 C1340,330 1440,300 1440,300 L1440,420 L0,420 Z"
                />
                <path
                    fill="#0B57D0"
                    transform="translate(1440,0)"
                    d="M0,300 C220,360 420,250 620,300 C820,350 980,270 1160,300 C1340,330 1440,300 1440,300 L1440,420 L0,420 Z"
                />
            </g>
        </svg>
    </div>
</template>

<style scoped lang="scss">
.wave-wrap {
    position: relative;
    width: 100%;
    height: 100vh; /* 🔥 full screen */
    overflow: hidden;
}

.wave-svg {
    width: 100%;
    height: 100%;
    display: block;
}

.layer {
    will-change: transform;
}

.layer-1 {
    animation: drift-1 14s linear infinite;
}
.layer-2 {
    animation: drift-2 10s linear infinite;
}
.layer-3 {
    animation: drift-3 7s linear infinite;
}

@keyframes drift-1 {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(-1440px);
    }
}
@keyframes drift-2 {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(-1440px);
    }
}
@keyframes drift-3 {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(-1440px);
    }
}

/* Optional: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
    .layer-1,
    .layer-2,
    .layer-3 {
        animation: none;
    }
}
</style>
