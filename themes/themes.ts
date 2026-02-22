export type ThemeKey = 'white' | 'red' | 'blue' | 'yellow';
export type Theme = {
    name: ThemeKey;
    colors: {
        timerBg: string;
        timerText: string;
        buttonBackground: string;
        buttonText: string;
        timerLightStrength: string;
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
            timerLightStrength: '0.1',
        },
    },
    red: {
        name: 'red',
        colors: {
            timerBg: '221, 167, 170',
            timerText: '221, 167, 170',
            buttonBackground: '97, 58, 60',
            buttonText: '255, 255, 255',
            timerLightStrength: '0.15',
        },
    },
    blue: {
        name: 'blue',
        colors: {
            timerBg: '134, 187, 233',
            timerText: '134, 187, 233',
            buttonBackground: '45, 78, 108',
            buttonText: '255, 255, 255',
            timerLightStrength: '0.15',
        },
    },
    yellow: {
        name: 'yellow',
        colors: {
            timerBg: '194, 181, 107',
            timerText: '194, 181, 107',
            buttonBackground: '96, 89, 52',
            buttonText: '255, 255, 255',
            timerLightStrength: '0.15',
        },
    },
} satisfies Record<ThemeKey, Theme>;
