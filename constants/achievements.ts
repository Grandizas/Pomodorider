/**
 * Achievement definitions. The database stores only *unlocked keys + timestamps*
 * (a SECURITY DEFINER trigger on the `streaks` table inserts them — clients can
 * read their own rows but cannot write any). All display metadata lives here.
 *
 * IMPORTANT: the `key`/`threshold` pairs below MUST stay in sync with the
 * milestones in the `handle_streak_achievements` DB trigger. If you add a tier
 * here, add it to the trigger (and vice versa) or it will never unlock.
 */
export interface AchievementDef {
    key: string;
    name: string;
    description: string;
    /** Iconify icon name, shown once unlocked. */
    icon: string;
    /** Streak length (days) required to unlock. */
    threshold: number;
}

/** Streak-milestone achievements, ordered by threshold. */
export const STREAK_ACHIEVEMENTS: AchievementDef[] = [
    {
        key: 'streak_3',
        name: 'Getting Started',
        description: 'Reach a 3-day streak',
        icon: 'fire',
        threshold: 3,
    },
    {
        key: 'streak_7',
        name: 'Week Warrior',
        description: 'Reach a 7-day streak',
        icon: 'bolt',
        threshold: 7,
    },
    {
        key: 'streak_14',
        name: 'Fortnight',
        description: 'Reach a 14-day streak',
        icon: 'calendar-range',
        threshold: 14,
    },
    {
        key: 'streak_30',
        name: 'Unstoppable',
        description: 'Reach a 30-day streak',
        icon: 'rocket-launch',
        threshold: 30,
    },
    {
        key: 'streak_100',
        name: 'Centurion',
        description: 'Reach a 100-day streak',
        icon: 'trophy-star',
        threshold: 100,
    },
];

/** All achievements, in display order. (Just streak tiers for now.) */
export const ACHIEVEMENTS: AchievementDef[] = [...STREAK_ACHIEVEMENTS];

/** key -> definition, for toast/lookups. */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> =
    Object.fromEntries(ACHIEVEMENTS.map((a) => [a.key, a]));
