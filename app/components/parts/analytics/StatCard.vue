<template>
    <div class="stat-card">
        <span class="stat-card__label">{{ label }}</span>
        <span class="stat-card__value">{{ value }}</span>
        <span v-if="sub" class="stat-card__sub">{{ sub }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string;
    value: string;
    /** Optional secondary line, e.g. "12 sessions". */
    sub?: string;
}>();
</script>

<style scoped lang="scss">
.stat-card {
    display: flex;
    flex-direction: column;
    gap: spacing(0.5);
    padding: $spacing-md;
    border-radius: $radius-xl;
    background: $button-background-color;
    box-shadow: $shadow-sm;

    &__label {
        font-size: rem(12px);
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: $text-secondary;
    }

    &__value {
        font-size: rem(28px);
        font-weight: 700;
        line-height: 1.1;
        color: $text-color;
    }

    &__sub {
        font-size: rem(13px);
        color: $text-secondary;
    }
}
</style>
