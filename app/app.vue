<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <Analytics />
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>
