<template>
    <ul class="theme-list">
        <li
            v-for="[themeName, theme] in Object.entries(themes)"
            :style="{
                background: `radial-gradient(circle at 50% 30%, transparent, rgb(${theme.colors.timerBg}))`,
            }"
            :class="{ active: themeName === currentTheme }"
            @click="selectTheme(themeName as ThemeKey)"
        />
    </ul>
</template>

<script setup lang="ts">
import { type ThemeKey, themes } from '~~/themes/themes';
import { useThemeStore } from '~~/stores/theme';

const themeStore = useThemeStore();

const currentTheme = ref(themeStore.activeTheme);
const isDropdownOpen = ref(false);

onMounted(() => {
    themeStore.applyTheme(currentTheme.value);
});

function selectTheme(theme: ThemeKey) {
    themeStore.applyTheme(theme as ThemeKey);
    isDropdownOpen.value = false;
}
</script>

<style scoped lang="scss">
.theme-list {
    margin: 0;
    padding: 0;
    display: flex;
    gap: spacing(2);
    list-style: none;
    align-items: center;
    flex-direction: column;

    li {
        cursor: pointer;
        width: rem(30px);
        height: rem(30px);
        border-radius: 50%;
        transition: all 250ms ease-in-out;

        &.active {
            width: rem(50px);
            height: rem(50px);
        }

        &:not(.active) {
            opacity: 0.7;

            &:hover {
                opacity: 1;
                width: rem(40px);
                height: rem(40px);
            }
        }
    }
}
</style>
