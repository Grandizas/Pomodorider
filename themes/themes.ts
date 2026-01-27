export type ThemeKey = 'ocean';

export const themes = {
    ocean: {
        name: 'Ocean',
        colors: {
            background: '#222222',
            timerBg: '#22222266',
            timerText: '#FFFFFF',
            accent: '#57637D',
            logoGradientStart: '#FFFFFF',
            logoGradientEnd: '#57637D',
            buttonBackground: '#FFFFFF',
            buttonText: '#222222',
        },
    },
} satisfies Record<ThemeKey, any>;
