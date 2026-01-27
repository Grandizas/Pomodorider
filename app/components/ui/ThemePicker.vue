<template>
    <div class="theme-picker">
        <ui-button @click="isDropdownOpen = true">Themes</ui-button>
        <div v-if="isDropdownOpen" class="theme-picker__dropdown">
            <div
                class="theme-picker__dropdown--bg"
                @click="isDropdownOpen = false"
            />
            <ul>
                <li
                    v-for="[themeName, theme] in Object.entries(themes)"
                    :style="{
                        background: `linear-gradient(to right bottom, ${theme.colors.pageBackgroundStart}, ${theme.colors.pageBackgroundEnd})`,
                    }"
                    @click="applyTheme(themeName as ThemeKey)"
                >
                    {{ themeName }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { applyTheme } from '~/composable/applyTheme';
import { type ThemeKey, themes } from '~~/themes/themes';

const currentTheme = 'ocean';
const isDropdownOpen = ref(false);

onMounted(() => {
    applyTheme(currentTheme);
});
</script>

<style scoped lang="scss">
$shadow:
    rgba(0, 0, 0, 0.25) 0 54px 55px,
    rgba(0, 0, 0, 0.12) 0px -12px 30px,
    rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px,
    rgba(0, 0, 0, 0.09) 0px -3px 5px;

.theme-picker {
    &__dropdown {
        &--bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 5;
            background: rgba(0, 0, 0, 0.4);
        }

        ul {
            top: 6rem;
            z-index: 10;
            height: 85vh;
            list-style: none;
            position: absolute;
            left: $spacing-page;
            padding: spacing(4);
            background: #111111;
            box-shadow: $shadow;
            border-radius: 1.5rem;
            width: calc(100% - #{$spacing-page} * 2);

            li {
                width: 20rem;
                height: 10rem;
                font-size: 2rem;
                cursor: pointer;
                padding: spacing(1);
                border-radius: 0.5rem;
                box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
                text-transform: capitalize;
                transition:
                    box-shadow 0.25s ease-in-out,
                    transform 0.15s ease-in-out;

                &:hover {
                    box-shadow: $shadow;
                    transform: translateY(-2px);
                }
            }
        }
    }
}
</style>
