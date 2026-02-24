import { defineStore } from 'pinia';
import { Howl } from 'howler';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
    workDuration: number; // in minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number; // After how many work sessions
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    sounds: {
        start: string;
        pause: string;
        end: string;
    };
}

export const useTimerStore = defineStore('timer', {
    state: () => ({
        // Timer state
        mode: 'work' as TimerMode,
        timeRemaining: 25 * 60, // in seconds
        isRunning: false,
        isPaused: false,

        // Session tracking
        sessionsCompleted: 0,
        totalWorkTime: 0, // in seconds

        // Settings
        settings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            soundEnabled: true,
            soundVolume: 0.5,
            sounds: {
                start: '/sounds/start.mp3',
                pause: '/sounds/pause.mp3',
                end: '/sounds/end.mp3',
            },
        } as TimerSettings,

        // Internal
        intervalId: null as number | null,
        startSound: null as Howl | null,
        pauseSound: null as Howl | null,
        endSound: null as Howl | null,
        soundSources: {
            start: '',
            pause: '',
            end: '',
        },
    }),

    getters: {
        minutes: (state) => Math.floor(state.timeRemaining / 60),
        seconds: (state) => state.timeRemaining % 60,

        formattedTime: (state) => {
            const mins = Math.floor(state.timeRemaining / 60);
            const secs = state.timeRemaining % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        nextMode: (state) => {
            if (state.mode === 'work') {
                const shouldLongBreak =
                    (state.sessionsCompleted + 1) %
                        state.settings.longBreakInterval ===
                    0;
                return shouldLongBreak ? 'longBreak' : 'shortBreak';
            }
            return 'work';
        },
    },

    actions: {
        getDuration(mode: TimerMode): number {
            switch (mode) {
                case 'work':
                    return this.settings.workDuration;
                case 'shortBreak':
                    return this.settings.shortBreakDuration;
                case 'longBreak':
                    return this.settings.longBreakDuration;
            }
        },

        playSound(type: 'start' | 'pause' | 'end', forceFile?: string) {
            if (!this.settings.soundEnabled && !forceFile) return;

            const soundFile = forceFile || this.settings.sounds[type];
            if (!soundFile) return;

            // Use a specific property based on type
            const soundProp = `${type}Sound` as
                | 'startSound'
                | 'pauseSound'
                | 'endSound';

            // If we're forcing a file (preview), we might want to create a new one or reuse
            if (forceFile) {
                const tempSound = new Howl({
                    src: [forceFile],
                    volume: this.settings.soundVolume,
                });
                tempSound.play();
                return;
            }

            if (!this[soundProp] || this.soundSources[type] !== soundFile) {
                this[soundProp] = new Howl({
                    src: [soundFile],
                    volume: this.settings.soundVolume,
                });
                this.soundSources[type] = soundFile;
            }

            this[soundProp]?.play();
        },

        start() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.isPaused = false;
                this.playSound('start');
                this.tick();
            }
        },

        pause() {
            this.isPaused = true;
            this.isRunning = false;
            this.playSound('pause');
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        resume() {
            if (this.isPaused) {
                this.isPaused = false;
                this.isRunning = true;
                this.playSound('start');
                this.tick();
            }
        },

        reset() {
            this.pause();
            this.timeRemaining = this.getDuration(this.mode) * 60;
        },

        skip() {
            this.completeSession();
        },

        tick() {
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
            }

            this.intervalId = window.setInterval(() => {
                if (this.isRunning && this.timeRemaining > 0) {
                    this.timeRemaining--;

                    if (this.mode === 'work') {
                        this.totalWorkTime++;
                    }

                    if (this.timeRemaining === 0) {
                        this.completeSession();
                    }
                }
            }, 1000);
        },

        completeSession() {
            this.pause();

            // Play notification sound
            this.playSound('end');

            // Update session count
            if (this.mode === 'work') {
                this.sessionsCompleted++;
            }

            // Switch to next mode
            const nextMode = this.nextMode;
            this.switchMode(nextMode);

            // Auto-start next session if enabled
            const shouldAutoStart =
                (nextMode !== 'work' && this.settings.autoStartBreaks) ||
                (nextMode === 'work' && this.settings.autoStartWork);

            if (shouldAutoStart) {
                this.start();
            }
        },

        switchMode(mode: TimerMode) {
            this.mode = mode;
            this.timeRemaining = this.getDuration(mode) * 60;
            this.isRunning = false;
            this.isPaused = false;
        },

        updateSettings(newSettings: Partial<TimerSettings>) {
            this.settings = { ...this.settings, ...newSettings };

            // Update sound volume if changed
            if (newSettings.soundVolume !== undefined) {
                this.startSound?.volume(newSettings.soundVolume);
                this.pauseSound?.volume(newSettings.soundVolume);
                this.endSound?.volume(newSettings.soundVolume);
            }

            // Reset timer if duration changed
            if (
                newSettings.workDuration !== undefined ||
                newSettings.shortBreakDuration !== undefined ||
                newSettings.longBreakDuration !== undefined
            ) {
                if (!this.isRunning) {
                    this.reset();
                }
            }
        },

        resetStats() {
            this.sessionsCompleted = 0;
            this.totalWorkTime = 0;
        },
    },
});
