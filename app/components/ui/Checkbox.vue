<template>
    <label :for="id" class="checkbox-wrapper">
        <input :id="id" type="checkbox" class="checkbox" />
        <span class="checkbox-label">{{ text }}</span>
    </label>
</template>

<script setup lang="ts">
defineProps<{
    id: string;
    text: string;
}>();
</script>

<style scoped lang="scss">
@use 'sass:map';

.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 3px;
    background-color: transparent;
    border: 1.5px solid map.get(map.get($colors, neutral), 600);

    &:checked {
        border-color: map.get(map.get($colors, brand), 600);
        background-color: map.get(map.get($colors, brand), 600);
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='white' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-size: 10px 8px;
        background-repeat: no-repeat;
        background-position: center;
    }
}

.checkbox-label {
    font-size: 14px;
    user-select: none;
    color: 1.5px solid map.get(map.get($colors, neutral), 100);
}
</style>
