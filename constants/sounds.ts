type SoundOption = {
    label: string;
    value: string;
    fileName: string;
};

export const startSounds: SoundOption[] = [
    {
        label: 'Default start',
        value: 'default_start',
        fileName: 'start.mp3',
    },
];

export const pauseSounds: SoundOption[] = [
    {
        label: 'Default pause',
        value: 'default_pause',
        fileName: 'pause.mp3',
    },
];

export const finishSounds: SoundOption[] = [
    {
        label: 'Default finish',
        value: 'default_finish',
        fileName: 'alarm-1.mp3',
    },
];
