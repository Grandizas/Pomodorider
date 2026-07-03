export type SoundOption = {
    label: string;
    value: string;
    fileName: string;
};

/**
 * Custom sounds live inside the persisted settings blob (localStorage + the
 * synced `settings_json`), so these caps keep that blob small enough for both
 * the browser storage quota and a reasonable DB row.
 */
export const MAX_CUSTOM_SOUNDS = 5;
export const MAX_CUSTOM_SOUND_BYTES = 512 * 1024; // 512 KB per file

export const startSounds: SoundOption[] = [
    {
        label: 'Glass 1',
        value: 'start_glass_1',
        fileName: 'start/start_glass_1.wav',
    },
    {
        label: 'Glass 2',
        value: 'start_glass_2',
        fileName: 'start/start_glass_2.wav',
    },
    {
        label: 'Glass 3',
        value: 'start_glass_3',
        fileName: 'start/start_glass_3.wav',
    },
    {
        label: 'Glass 4',
        value: 'start_glass_4',
        fileName: 'start/start_glass_4.wav',
    },
];

export const pauseSounds: SoundOption[] = [
    {
        label: 'Glass 1',
        value: 'pause_glass_1',
        fileName: 'pause/pause_glass_1.wav',
    },
    {
        label: 'Glass 2',
        value: 'pause_glass_2',
        fileName: 'pause/pause_glass_2.wav',
    },
    {
        label: 'Glass 3',
        value: 'pause_glass_3',
        fileName: 'pause/pause_glass_3.wav',
    },
    {
        label: 'Glass 4',
        value: 'pause_glass_4',
        fileName: 'pause/pause_glass_4.wav',
    },
];

export const resumeSounds: SoundOption[] = [
    {
        label: 'Glass 1',
        value: 'resume_glass_1',
        fileName: 'resume/resume_glass_1.wav',
    },
    {
        label: 'Glass 2',
        value: 'resume_glass_2',
        fileName: 'resume/resume_glass_2.wav',
    },
    {
        label: 'Glass 3',
        value: 'resume_glass_3',
        fileName: 'resume/resume_glass_3.wav',
    },
];

export const finishSounds: SoundOption[] = [
    {
        label: 'Glass 1',
        value: 'finish_glass_1',
        fileName: 'finish/finish_glass_1.wav',
    },
    {
        label: 'Glass 2',
        value: 'finish_glass_2',
        fileName: 'finish/finish_glass_2.wav',
    },
    {
        label: 'Glass 3',
        value: 'finish_glass_3',
        fileName: 'finish/finish_glass_3.wav',
    },
    {
        label: 'Glass 4',
        value: 'finish_glass_4',
        fileName: 'finish/finish_glass_4.wav',
    },
];
