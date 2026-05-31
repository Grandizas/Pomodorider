<template>
    <div class="input-field">
        <label v-if="label" :for="id">{{ label }}</label>

        <div class="input-field__input">
            <!-- ----- * Left icon * ----- -->
            <FontAwesomeIcon
                v-if="leftIcon"
                :icon="leftIcon"
                class="input-field__input--left-icon"
            />

            <!-- ----- * Input * ----- -->
            <input
                :id="id"
                v-model="modelValue"
                :type="type"
                :required="required"
                :disabled="disabled"
                :minlength="minLength"
                :placeholder="placeholder"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? `${id}-error` : undefined"
                class="input"
                :class="{ 'input--error': error }"
            />

            <!-- ----- * Right icons * ----- -->
            <div v-if="rightIcons?.length" class="input-field__input--icons">
                <FontAwesomeIcon
                    v-for="(icon, index) in rightIcons"
                    :key="index"
                    :icon="icon"
                    class="icon"
                />
            </div>
        </div>

        <p
            v-if="error"
            :id="`${id}-error`"
            role="alert"
            class="input-field__error"
        >
            {{ error }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

withDefaults(
    defineProps<{
        id: string;
        type?: string;
        label?: string;
        required?: boolean;
        minLength?: number;
        disabled?: boolean;
        placeholder?: string;
        error?: string;
        leftIcon?: [string, string]; // ['far', 'eye']
        rightIcons?: [string, string][]; // ['far', 'eye'][]
    }>(),
    {
        type: 'text',
        minLength: 0,
        placeholder: '',
    },
);

const modelValue = defineModel<string>({ required: true });
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_input.scss';
</style>
