export type ThemeKey = 'white' | 'red' | 'blue' | 'yellow';
export type Theme = {
    name: ThemeKey;
    colors: {
        timerBg: string;
        timerText: string;
        buttonBackground: string;
        buttonText: string;
    };
};

export const themes = {
    white: {
        name: 'white',
        colors: {
            timerBg: '255, 255, 255',
            timerText: '255, 255, 255',
            buttonBackground: '100, 100, 100',
            buttonText: '255, 255, 255',
        },
    },
    red: {
        name: 'red',
        colors: {
            timerBg: '158, 62, 68',
            timerText: '158, 62, 68',
            buttonBackground: '97, 58, 60',
            buttonText: '255, 255, 255',
        },
    },
    blue: {
        name: 'blue',
        colors: {
            timerBg: '35, 114, 184',
            timerText: '35, 114, 184',
            buttonBackground: '45, 78, 108',
            buttonText: '255, 255, 255',
        },
    },
    yellow: {
        name: 'yellow',
        colors: {
            timerBg: '159, 145, 65',
            timerText: '159, 145, 65',
            buttonBackground: '96, 89, 52',
            buttonText: '255, 255, 255',
        },
    },
} satisfies Record<ThemeKey, Theme>;
