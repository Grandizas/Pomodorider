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
                :min="min"
                :max="max"
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
            <div
                v-if="rightIcons?.length && type !== 'number'"
                class="input-field__input--icons"
            >
                <FontAwesomeIcon
                    v-for="(icon, index) in rightIcons"
                    :key="index"
                    :icon="icon"
                    class="icon"
                />
            </div>

            <!-- ----- * Number stepper * ----- -->
            <div v-if="type === 'number'" class="input-field__input--stepper">
                <button
                    type="button"
                    aria-label="Increase"
                    :disabled="disabled || atMax"
                    @click="increment"
                >
                    <FontAwesomeIcon :icon="['far', 'plus']" class="icon" />
                </button>
                <button
                    type="button"
                    aria-label="Decrease"
                    :disabled="disabled || atMin"
                    @click="decrement"
                >
                    <FontAwesomeIcon :icon="['far', 'minus']" class="icon" />
                </button>
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
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = withDefaults(
    defineProps<{
        id: string;
        min?: string;
        max?: string;
        step?: string;
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

const modelValue = defineModel<string | number>({ required: true });

// ----- * Number stepper * ----- //
const stepSize = computed(() => Number(props.step) || 1);
const minNum = computed(() =>
    props.min !== undefined ? Number(props.min) : -Infinity,
);
const maxNum = computed(() =>
    props.max !== undefined ? Number(props.max) : Infinity,
);

const currentNum = computed(() => {
    const value = Number(modelValue.value);
    return Number.isFinite(value) ? value : 0;
});

const atMin = computed(() => currentNum.value <= minNum.value);
const atMax = computed(() => currentNum.value >= maxNum.value);

const stepBy = (direction: 1 | -1) => {
    const next = currentNum.value + direction * stepSize.value;
    modelValue.value = Math.min(maxNum.value, Math.max(minNum.value, next));
};

const increment = () => stepBy(1);
const decrement = () => stepBy(-1);
</script>

<style scoped lang="scss">
@use '@@/app/assets/styles/components/ui/_input.scss';
</style>
