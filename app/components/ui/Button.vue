<template>
    <component :is="element" :class="`${variant}-btn btn`" v-bind="attrs">
        <slot />
    </component>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        to?: string;
        variant?: 'primary' | 'secondary' | 'icon';
    }>(),
    {
        variant: 'primary',
    },
);

const element = computed(() =>
    props.to ? resolveComponent('NuxtLink') : 'button',
);
const attrs = computed(() => {
    if (props.to) {
        return { to: props.to };
    }
    return {
        type: 'button',
    };
});
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_button.scss';
</style>
