<template>
    <main class="policy-layout">
        <div class="policy-layout__content">
            <ui-button variant="icon" class="mb-4" @click="$router.back()">
                <Icon icon="heroicons:chevron-left" width="18" />
            </ui-button>
            <NuxtPage />
        </div>
    </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<style scoped lang="scss">
.policy-layout__content {
    margin: 0 auto;
    max-width: 800px;
    padding: 80px 20px;

    :deep(.policy-page) {
        line-height: 1.7;

        h1 {
            margin-bottom: rem(20px);
        }

        h2 {
            margin-top: rem(40px);
        }
    }
}
</style>
