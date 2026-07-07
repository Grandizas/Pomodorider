import { defineStore } from 'pinia';
import { Howl } from 'howler';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

/**
 * A user-uploaded sound. `data` is a self-describing `data:audio/…;base64,…`
 * URI, so it plays directly through Howler (which reads the format from the
 * mime type) and persists inside the settings blob with no extra storage. Slots
 * reference one by `custom:<id>`; see `resolveSoundSrc`.
 */
export interface CustomSound {
    id: string;
    label: string;
    data: string;
}

export interface TimerSettings {
    workDuration: number; // in minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number; // After how many work sessions
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    keepAwake: boolean; // hold a screen wake lock while the timer runs
    notificationsEnabled: boolean; // browser notification when a session ends away from the tab
    soundEnabled: boolean;
    soundVolume: number;
    sounds: {
        start: string;
        breakStart: string; // played when a break session starts (vs. work)
        pause: string;
        resume: string;
        end: string;
    };
    /** User-uploaded sounds, referenced from the slots above as `custom:<id>`. */
    customSounds: CustomSound[];
}

/**
 * Howler can't infer a codec from an extension-less `data:` URI, so derive a
 * `format` hint from its mime subtype (e.g. `data:audio/mpeg` → 'mp3'). Returns
 * undefined for regular file paths, which Howler handles on its own.
 */
function formatFromSrc(src: string): string[] | undefined {
    const match = /^data:audio\/([^;,]+)/i.exec(src);
    if (!match) return undefined;
    let ext = match[1]!.toLowerCase();
    if (ext === 'mpeg') ext = 'mp3';
    else if (ext === 'wave' || ext === 'x-wav' || ext === 'x-pn-wav')
        ext = 'wav';
    else if (ext === 'x-m4a') ext = 'm4a';
    return [ext];
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

        // Monotonic counter of *genuinely finished* work sessions (timer ran to
        // 0 — skips don't count). The streak layer watches this and records one
        // timer_sessions row per increment. Never reset, so a watcher can rely
        // on it only ever going up.
        completedWorkSessions: 0,

        // Bumped once per genuinely-finished session — work OR break, skips
        // excluded — so client-only listeners (e.g. browser notifications) can
        // react to a session ending without the store itself touching browser
        // APIs. `lastEndedMode` holds the mode that just finished. See
        // `notifications.client.ts`.
        sessionEndCount: 0,
        lastEndedMode: 'work' as TimerMode,

        // Settings
        settings: {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            keepAwake: false,
            notificationsEnabled: false,
            soundEnabled: true,
            soundVolume: 0.5,
            sounds: {
                start: '/sounds/start/start_glass_1.wav',
                breakStart: '/sounds/start/start_glass_3.wav',
                pause: '/sounds/pause/pause_glass_1.wav',
                resume: '/sounds/resume/resume_glass_1.wav',
                end: '/sounds/finish/finish_glass_1.wav',
            },
            customSounds: [],
        } as TimerSettings,

        // Internal
        intervalId: null as number | null,
        startSound: null as Howl | null,
        breakStartSound: null as Howl | null,
        pauseSound: null as Howl | null,
        resumeSound: null as Howl | null,
        endSound: null as Howl | null,
        soundSources: {
            start: '',
            breakStart: '',
            pause: '',
            resume: '',
            end: '',
        },
        // Timestamp of the last control sound, used to throttle rapid
        // play/pause clicks so a fast burst doesn't fire a sound per click.
        lastSoundAt: 0,
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

        /**
         * Turn a slot value into a concrete source Howler can load. A
         * `custom:<id>` ref resolves to its stored data URI; a missing custom
         * (removed, or not synced to this device) yields '' so the caller skips
         * it instead of erroring. Anything else is a path, returned as-is.
         */
        resolveSoundSrc(ref: string): string {
            if (ref.startsWith('custom:')) {
                const id = ref.slice('custom:'.length);
                return (
                    this.settings.customSounds.find((c) => c.id === id)?.data ??
                    ''
                );
            }
            return ref;
        },

        playSound(
            type: 'start' | 'breakStart' | 'pause' | 'resume' | 'end',
            forceFile?: string,
        ) {
            if (!this.settings.soundEnabled && !forceFile) return;

            // A slot may reference a built-in path or a `custom:<id>` upload.
            // `forceFile` (preview) is already a concrete src, so it passes
            // through the resolver untouched.
            const ref = forceFile || this.settings.sounds[type];
            if (!ref) return;

            const src = this.resolveSoundSrc(ref);
            if (!src) return;

            const format = formatFromSrc(src);

            // Use a specific property based on type
            const soundProp = `${type}Sound` as
                | 'startSound'
                | 'breakStartSound'
                | 'pauseSound'
                | 'resumeSound'
                | 'endSound';

            // If we're forcing a file (preview), we might want to create a new one or reuse
            if (forceFile) {
                const tempSound = new Howl({
                    src: [src],
                    volume: this.settings.soundVolume,
                    ...(format ? { format } : {}),
                });
                tempSound.once('end', () => tempSound.unload());
                tempSound.once('loaderror', () => tempSound.unload());
                tempSound.play();
                return;
            }

            // Throttle the rapidly-clickable control sounds (start/pause) so a
            // fast click burst doesn't fire one sound per click. The end alarm
            // is exempt — it only ever plays once on completion.
            if (type !== 'end') {
                const now = Date.now();
                if (now - this.lastSoundAt < 150) return;
                this.lastSoundAt = now;
            }

            // Cache by the slot ref (not the resolved src) so we never key the
            // map on a huge data URI, and so swapping a custom sound busts it.
            if (!this[soundProp] || this.soundSources[type] !== ref) {
                this[soundProp] = new Howl({
                    src: [src],
                    volume: this.settings.soundVolume,
                    ...(format ? { format } : {}),
                });
                this.soundSources[type] = ref;
            }

            // Stop any in-flight playback of this sound before replaying, so
            // rapid play/pause toggling can't stack overlapping instances.
            this[soundProp]?.stop();
            this[soundProp]?.play();
        },

        start() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.isPaused = false;
                // Breaks get their own start cue; work uses the plain start.
                this.playSound(this.mode === 'work' ? 'start' : 'breakStart');
                this.tick();
            }
        },

        pause(silent: boolean = false) {
            this.isPaused = true;
            this.isRunning = false;
            if (!silent) this.playSound('pause');
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        resume() {
            if (this.isPaused) {
                this.isPaused = false;
                this.isRunning = true;
                this.playSound('resume');
                this.tick();
            }
        },

        reset(silent: boolean = false) {
            this.pause(silent);
            this.timeRemaining = this.getDuration(this.mode) * 60;
        },

        skip() {
            this.completeSession(true);
        },

        // Note: `completeSession`'s parameter is named `skipped` — it's true only
        // when reached via skip(), so it doubles as "don't play the end sound"
        // and "don't count toward the streak".

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

        completeSession(skipped: boolean = false) {
            // Capture before pause()/switchMode() move state on.
            const endedMode = this.mode;

            this.pause();

            // Play notification sound (not when the user skipped the session)
            if (!skipped) {
                this.playSound('end');
            }

            // Update session counts
            if (this.mode === 'work') {
                this.sessionsCompleted++;
                // Only a session the user actually finished feeds the streak.
                if (!skipped) {
                    this.completedWorkSessions++;
                }
            }

            // Signal a genuine completion for client-side listeners (browser
            // notifications). Mirrors the end sound: only on real completion,
            // never on a skip.
            if (!skipped) {
                this.lastEndedMode = endedMode;
                this.sessionEndCount++;
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
                this.breakStartSound?.volume(newSettings.soundVolume);
                this.pauseSound?.volume(newSettings.soundVolume);
                this.resumeSound?.volume(newSettings.soundVolume);
                this.endSound?.volume(newSettings.soundVolume);
            }

            // Reset timer if duration changed
            if (
                newSettings.workDuration !== undefined ||
                newSettings.shortBreakDuration !== undefined ||
                newSettings.longBreakDuration !== undefined
            ) {
                if (!this.isRunning) {
                    this.reset(true);
                }
            }
        },

        resetStats() {
            this.sessionsCompleted = 0;
            this.totalWorkTime = 0;
        },
    },
});
