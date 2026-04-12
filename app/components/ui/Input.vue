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
                :placeholder="placeholder"
                class="input"
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
        disabled?: boolean;
        placeholder?: string;
        leftIcon?: [string, string]; // ['far', 'eye']
        rightIcons?: [string, string][]; // ['far', 'eye'][]
    }>(),
    {
        type: 'text',
        placeholder: '',
    },
);

const modelValue = defineModel<string>('modelValue', { required: true });
</script>

<style scoped lang="scss">
@use 'sass:map';

.input-field {
    display: flex;
    gap: spacing(1);
    flex-direction: column;

    label {
        font-weight: 500;
        font-size: $text-md;
        color: map.get(map.get($colors, neutral), 300);
    }

    &__input {
        position: relative;

        $horizontal-padding: 12px;
        $vertical-padding: 8px;
        $icon-width: 13px;

        &--left-icon,
        &--icons .icon {
            width: rem($icon-width);
            height: rem($icon-width);
            color: map.get(map.get($colors, neutral), 400);
        }

        &--left-icon,
        &--icons {
            top: 50%;
            position: absolute;
            transform: translateY(-50%);
        }

        &--left-icon {
            left: $horizontal-padding;
        }

        &--icons {
            right: $horizontal-padding;
        }

        input {
            width: 100%;
            border-radius: $radius-md;
            background-color: transparent;
            color: map.get(map.get($colors, neutral), 100);
            box-shadow: 0 1px 2px 0 rgba(255, 255, 255, 0.05);
            border: 1px solid map.get(map.get($colors, neutral), 700);
            padding: 10px $horizontal-padding 10px
                rem(calc($icon-width + 12px * 1.6)); // 12 is padding

            &:focus {
                outline: none;
                border-color: map.get(map.get($colors, brand), 500);
            }
        }
    }
}
</style>
