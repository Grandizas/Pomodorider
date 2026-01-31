export type ThemeKey = 'ocean' | 'trees' | 'grass';

export const themes = {
    ocean: {
        name: 'Ocean',
        video: 'Ocean.mp4',
        colors: {
            pageBackgroundStart: '#030117',
            pageBackgroundEnd: '#525E77',
            timerBg: '#22222266',
            timerText: '#FFFFFF',
            accent: '#57637D',
            logoGradientStart: '#FFFFFF',
            logoGradientEnd: '#57637D',
            buttonBackground: '#FFFFFF',
            buttonText: '#222222',
        },
    },
    trees: {
        name: 'Trees',
        video: 'Trees.mp4',
        colors: {
            pageBackgroundStart: '#13170C',
            pageBackgroundEnd: '#937736',
            timerBg: '#22222266',
            timerText: '#FFFFFF',
            accent: '#937736',
            logoGradientStart: '#937736',
            logoGradientEnd: '#13170C',
            buttonBackground: '#FFFFFF',
            buttonText: '#FFFFFF',
        },
    },
    grass: {
        name: 'Grass',
        video: 'Grass.mp4',
        colors: {
            pageBackgroundStart: '#5d8ab5',
            pageBackgroundEnd: '#937736',
            timerBg: '#22222266',
            timerText: '#FFFFFF',
            accent: '#937736',
            logoGradientStart: '#937736',
            logoGradientEnd: '#5d8ab5',
            buttonBackground: '#FFFFFF',
            buttonText: '#FFFFFF',
        },
    },
} satisfies Record<ThemeKey, any>;
