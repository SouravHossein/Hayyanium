/* ── Progression / Mastery-RPG Types ──────────────────────────────
   All player-progression, zone, mission, reward, daily-mission and
   boss types used by progressionEngine and progressionStorage.
   quizTypes.ts is intentionally unchanged.
────────────────────────────────────────────────────────────────── */

/* ── Mission types ─────────────────────────────────────────────── */
export type MissionType = 'learn' | 'practice' | 'speed' | 'recovery' | 'boss';

/* ── Rank labels ───────────────────────────────────────────────── */
export type PlayerRank =
  | 'Novice'
  | 'Apprentice'
  | 'Lab Adept'
  | 'Elementalist'
  | 'Master Chemist'
  | 'Grand Alchemist';

/* ── Badge IDs ─────────────────────────────────────────────────── */
export type BadgeId =
  | 'first-quiz'
  | 'week-streak'
  | 'perfect-run'
  | 'comeback-king'
  | 'speed-demon'
  | 'master-chemist'
  | 'boss-slayer'
  | 'daily-devotee'
  | string; // zone-cleared-X / boss-cleared-X templates

/* ── Player progress (top-level state) ─────────────────────────── */
export interface PlayerProgress {
  playerXp: number;
  playerLevel: number;
  playerRank: PlayerRank;
  activeZoneId: string | null;
  unlockedMissionTypes: MissionType[];
  unlockedBossIds: string[];
  earnedBadges: BadgeId[];
  streakFreezeCount: number;
  lastDailyMissionDate: string | null;   // YYYY-MM-DD
  weeklyGoalProgress: WeeklyGoalProgress;
  hintsRemaining: number;
  retryShields: number;
}

/* ── Default starting state ────────────────────────────────────── */
export const DEFAULT_PLAYER_PROGRESS: PlayerProgress = {
  playerXp: 0,
  playerLevel: 1,
  playerRank: 'Novice',
  activeZoneId: 'period-1',
  unlockedMissionTypes: ['learn', 'practice'],
  unlockedBossIds: [],
  earnedBadges: [],
  streakFreezeCount: 0,
  lastDailyMissionDate: null,
  weeklyGoalProgress: {
    weekStart: '',
    elementsMastered: 0,
    zonesCleared: 0,
    bossesBeaten: 0,
    targetElements: 12,
    targetZones: 3,
    targetBosses: 2,
  },
  hintsRemaining: 3,
  retryShields: 1,
};

/* ── Zone definition (static config) ───────────────────────────── */
export interface ZoneDefinition {
  id: string;
  label: string;
  scopeType: 'period' | 'block' | 'category';
  scopeValue: number | string;
  icon: string;           // emoji
  color: string;          // tailwind gradient classes
  order: number;
  bossId: string;
  totalElements: number;  // pre-computed from element data
}

/* ── Zone progress (per-user runtime) ──────────────────────────── */
export interface ZoneProgress {
  zoneId: string;
  visitedMissions: MissionType[];
  masteryScore: number;       // 0-100 weighted accuracy
  coverageCount: number;      // distinct elements attempted in zone
  totalElements: number;
  bossUnlocked: boolean;
  bossCleared: boolean;
  badgeEarned: boolean;
}

/* ── Mission definition ─────────────────────────────────────────── */
export interface MissionDefinition {
  id: string;
  zoneId: string;
  type: MissionType;
  label: string;
  description: string;
  questionCount: number;
  timerEnabled: boolean;
  timerSeconds?: number;
  allowSkip: boolean;
  allowHint: boolean;
  xpReward: number;
  unlockedAtLevel?: number;
}

/* ── Mission result (post-quiz payload) ────────────────────────── */
export interface MissionResult {
  missionId: string;
  zoneId: string;
  type: MissionType;
  date: string;
  xpEarned: number;
  accuracy: number;
  bestStreak: number;
  newBadges: BadgeId[];
  leveledUp: boolean;
  newLevel?: number;
  newRank?: PlayerRank;
  comebackElements: number[];   // atomicNumbers improved weak→better
}

/* ── Reward unlock ─────────────────────────────────────────────── */
export interface RewardUnlock {
  type: 'mission-type' | 'hint-tokens' | 'retry-shield' | 'badge' | 'streak-freeze';
  value: string | number;
  label: string;
  description: string;
}

/* ── XP event (for UI breakdown) ───────────────────────────────── */
export interface XpEvent {
  source:
    | 'correct-answer'
    | 'streak-bonus'
    | 'first-mastery'
    | 'mission-complete'
    | 'comeback'
    | 'boss-clear';
  amount: number;
  label: string;
}

/* ── Daily mission set ──────────────────────────────────────────── */
export interface DailyMissionSet {
  date: string;                         // YYYY-MM-DD
  missions: [MissionDefinition, MissionDefinition, MissionDefinition];
  completedIds: string[];
}

/* ── Weekly goal ────────────────────────────────────────────────── */
export interface WeeklyGoalProgress {
  weekStart: string;           // ISO date string
  elementsMastered: number;
  zonesCleared: number;
  bossesBeaten: number;
  targetElements: number;
  targetZones: number;
  targetBosses: number;
}

/* ── Boss state ─────────────────────────────────────────────────── */
export interface BossState {
  bossId: string;
  zoneId: string;
  cleared: boolean;
  clearedDate?: string;
  bestAccuracy?: number;
}
