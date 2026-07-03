<template>
    <label
        :for="id"
        class="checkbox-wrapper"
        :class="{ 'is-disabled': disabled }"
    >
        <input
            v-model="modelValue"
            :id="id"
            type="checkbox"
            class="checkbox"
            :disabled="disabled"
        />
        <span class="checkbox-label">{{ text }}</span>
    </label>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        id: string;
        text: string;
        disabled?: boolean;
    }>(),
    { disabled: false },
);

const modelValue = defineModel<boolean>('modelValue', { default: false });
</script>

<style scoped lang="scss">
@use 'sass:map';

.checkbox-wrapper {
    display: flex;
    gap: spacing(1);
    cursor: pointer;
    align-items: center;

    &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;

        input[type='checkbox'] {
            cursor: not-allowed;
        }
    }
}

input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 6px;
    background-color: transparent;
    border: 1.5px solid map.get(map.get($colors, neutral), 600);
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease;

    &:checked {
        border-color: map.get(map.get($colors, neutral), 600);
        background-color: map.get(map.get($colors, neutral), 800);
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='white' stroke-width='1.75' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-size: 12px 10px;
        background-repeat: no-repeat;
        background-position: center;
    }

    &:focus-visible {
        outline: 2px solid map.get(map.get($colors, neutral), 400);
        outline-offset: 2px;
    }
}

.checkbox-label {
    font-size: 14px;
    user-select: none;
    color: map.get(map.get($colors, neutral), 100);
}
</style>
