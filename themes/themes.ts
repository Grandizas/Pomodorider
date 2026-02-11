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
            timerBg: '#FFFFFF',
            timerText: '#FFFFFF',
            buttonBackground: '#646464',
            buttonText: '#FFFFFF',
        },
    },
    red: {
        name: 'red',
        colors: {
            timerBg: '#9E3E44',
            timerText: '#9E3E44',
            buttonBackground: '#613a3c',
            buttonText: '#FFFFFF',
        },
    },
    blue: {
        name: 'blue',
        colors: {
            timerBg: '#2372B8',
            timerText: '#2372B8',
            buttonBackground: '#2d4e6c',
            buttonText: '#FFFFFF',
        },
    },
    yellow: {
        name: 'yellow',
        colors: {
            timerBg: '#9F9141',
            timerText: '#9F9141',
            buttonBackground: '#605934',
            buttonText: '#FFFFFF',
        },
    },
} satisfies Record<ThemeKey, Theme>;
