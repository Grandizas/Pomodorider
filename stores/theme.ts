import { defineStore } from 'pinia';
import { type ThemeKey, themes } from '../themes/themes';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        activeTheme: 'white' as ThemeKey,
    }),
    actions: {
        applyTheme(themeKey: ThemeKey) {
            const theme = themes[themeKey];

            this.activeTheme = themeKey;

            console.log('Theme', themeKey);

            Object.entries(theme.colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(
                    `--color-${key}`,
                    value,
                );
            });
        },
    },
});
