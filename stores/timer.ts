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
        } as TimerSettings,

        // Internal
        intervalId: null as number | null,
        notificationSound: null as Howl | null,
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

        initSound() {
            if (!this.notificationSound) {
                // Create a simple beep sound using Web Audio API data URI
                // This ensures the app works even without external sound files
                this.notificationSound = new Howl({
                    src: [
                        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi6Dzv3ajjsIHm7A7+SYTgwRWrLq8KFSEw1JouLyvWwfByyCzv/ZhDcIF2W48+qfTg0PWKjk77NfGAc+mNr1xnMmBSd+zPLekEAJFlyx6+yiUhQNR6Hg8bplIQcwhM7+14c2CBt7xvDglUoNEFWq5vSkUxUOSaLh8bljHwYsgs/+2IU3CBhruO7mnEwNEVmv5/KlUhYOS6Pg8bVjHgYqf8792IU4CBlruO/mnEwMEFSq5fSjVBQNRqHf8bZkHwYuf87/14c3CBhsu+/jnEwMEVOo5PKiVBUOSaHg8LdjIAYuf9D+14U3BxdqvvDim00NEk+m4/GlUhcOSKLg8LdjHwYsftD/2YM3Bxhqv+/im00MEE+l4vGlUhcOR6Hf77ZkHwYsftD+2IQ3Bxdpv+/in00NEE6m4/GkUhgPSKHf77ZiHwYqgNH+14Q4Bxdqv+/im00MEU6m4/KkURgPSKHf77ViHwYrftD+2IQ3Bxdpv/Dim00MEE+m4vKkURgPRqHf8LViHwcqgNH+14M4Bxdqv+/in00MEE+l4vKkUhgPRqHg8LViHwcrftD+2IM3CBdpv/Dhn00NEE6m4vKkURgORaLg8LVkIAYrftD+2IM4Bxdpv/Dhn00NEE6l4/KkURcOR6Hg8LRkIAYrftD+2IM4Bxdqv/Dhn00MEE+m4vKkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8LRkIAYrftD+2IM4Bxdqv/Dhn00NEE6l4/KkURgPRqHg8A==',
                    ],
                    volume: this.settings.soundVolume,
                });
            }
        },

        start() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.isPaused = false;
                this.tick();
            }
        },

        pause() {
            this.isPaused = true;
            this.isRunning = false;
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        resume() {
            if (this.isPaused) {
                this.isPaused = false;
                this.isRunning = true;
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
            if (this.settings.soundEnabled) {
                this.initSound();
                this.notificationSound?.play();
            }

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
            if (
                newSettings.soundVolume !== undefined &&
                this.notificationSound
            ) {
                this.notificationSound.volume(newSettings.soundVolume);
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
