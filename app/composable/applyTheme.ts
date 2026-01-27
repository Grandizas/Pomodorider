import { type ThemeKey, themes } from '~~/themes/themes';

export function applyTheme(themeKey: ThemeKey) {
    const theme = themes[themeKey];

    Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
    });
}
