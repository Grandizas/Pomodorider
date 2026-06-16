<script setup lang="ts">
// OG image template rendered by nuxt-og-image (satori). Satori supports only a
// subset of CSS — every element with children needs an explicit display:flex.
withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: 'Pomodorider',
        description: 'Free online Pomodoro timer',
    },
);
</script>

<template>
    <div
        style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #222222;
            color: #eaeaea;
            font-family: sans-serif;
            padding: 80px;
        "
    >
        <div style="display: flex; font-size: 88px; font-weight: 700">
            {{ title }}
        </div>
        <div
            style="
                display: flex;
                font-size: 40px;
                color: #a0a0a0;
                margin-top: 24px;
                text-align: center;
            "
        >
            {{ description }}
        </div>
    </div>
</template>
