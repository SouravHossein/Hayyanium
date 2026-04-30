/* ── Progression Engine ──────────────────────────────────────────
   XP calculation, level/rank resolution, zone mastery scoring,
   boss unlock conditions, daily mission generation.
   Pure functions — no direct localStorage access (use progressionStorage).
────────────────────────────────────────────────────────────────── */

import {
  PlayerProgress,
  PlayerRank,
  MissionResult,
  RewardUnlock,
  XpEvent,
  ZoneProgress,
  DailyMissionSet,
  MissionDefinition,
  MissionType,
  BadgeId,
  DEFAULT_PLAYER_PROGRESS,
  ZoneDefinition,
} from '../../types/progressionTypes';
import { ZONE_DEFINITIONS, buildMissionsForZone, ZONE_MAP } from '../../data/zones';
import { ElementMastery } from '../../types/quizTypes';

/* ══ Level Table ══════════════════════════════════════════════════ */
export interface LevelConfig {
  level: number;
  xpRequired: number;           // cumulative XP to reach this level
  rank: PlayerRank;
  unlocks: MissionType[];
  rewardLabel?: string;
}

export const LEVEL_TABLE: LevelConfig[] = [
  { level: 1,  xpRequired: 0,    rank: 'Novice',          unlocks: ['learn', 'practice'] },
  { level: 2,  xpRequired: 150,  rank: 'Apprentice',      unlocks: ['recovery'],         rewardLabel: 'Recovery missions unlocked!' },
  { level: 3,  xpRequired: 400,  rank: 'Lab Adept',       unlocks: ['speed'],            rewardLabel: 'Speed Run mode unlocked!' },
  { level: 4,  xpRequired: 750,  rank: 'Lab Adept',       unlocks: [],                   rewardLabel: '+2 Hint Tokens' },
  { level: 5,  xpRequired: 1100, rank: 'Elementalist',    unlocks: ['boss'],             rewardLabel: 'Boss Battles unlocked! 🎯' },
  { level: 6,  xpRequired: 1600, rank: 'Elementalist',    unlocks: [],                   rewardLabel: '+1 Retry Shield' },
  { level: 7,  xpRequired: 2300, rank: 'Master Chemist',  unlocks: [],                   rewardLabel: 'Mixed Gauntlets unlocked!' },
  { level: 8,  xpRequired: 3100, rank: 'Master Chemist',  unlocks: [],                   rewardLabel: '+1 Streak Freeze' },
  { level: 9,  xpRequired: 4000, rank: 'Master Chemist',  unlocks: [],                   rewardLabel: '+3 Hint Tokens' },
  { level: 10, xpRequired: 5200, rank: 'Grand Alchemist', unlocks: [],                   rewardLabel: 'Elite Runs unlocked! 🏆' },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_TABLE.find(l => l.level === level) ?? LEVEL_TABLE[LEVEL_TABLE.length - 1];
}

export function computeLevel(totalXp: number): { level: number; rank: PlayerRank; xpIntoLevel: number; xpForNext: number } {
  let current = LEVEL_TABLE[0];
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_TABLE[i].xpRequired) {
      current = LEVEL_TABLE[i];
      break;
    }
  }
  const nextConfig = LEVEL_TABLE.find(l => l.level === current.level + 1);
  const xpIntoLevel = totalXp - current.xpRequired;
  const xpForNext = nextConfig ? nextConfig.xpRequired - current.xpRequired : 9999;
  return { level: current.level, rank: current.rank, xpIntoLevel, xpForNext };
}

/* ══ XP Calculation ═══════════════════════════════════════════════ */
export interface XpCalculationInput {
  correctCount: number;
  totalCount: number;
  bestStreak: number;
  missionType: MissionType;
  missionXpReward: number;
  newMasteredElements: number;   // count first-mastered this session
  comebackElements: number;      // count weak elements recovered
  sameZonePlaysToday: number;    // for diminishing returns
  accuracy: number;              // 0-100
}

export function calculateXp(input: XpCalculationInput): { total: number; events: XpEvent[] } {
  const events: XpEvent[] = [];

  // Base: 10 XP per correct answer
  const baseXp = input.correctCount * 10;
  events.push({ source: 'correct-answer', amount: baseXp, label: `${input.correctCount} correct answers` });

  // Streak bonus: 5 XP per streak length
  if (input.bestStreak >= 3) {
    const streakXp = input.bestStreak * 5;
    events.push({ source: 'streak-bonus', amount: streakXp, label: `${input.bestStreak}× streak` });
  }

  // First-mastery bonus: 25 XP each
  if (input.newMasteredElements > 0) {
    const masteryXp = input.newMasteredElements * 25;
    events.push({ source: 'first-mastery', amount: masteryXp, label: `${input.newMasteredElements} first masteries` });
  }

  // Comeback bonus: 15 XP each weak→better element
  if (input.comebackElements > 0) {
    const comebackXp = input.comebackElements * 15;
    events.push({ source: 'comeback', amount: comebackXp, label: `${input.comebackElements} elements recovered` });
  }

  // Mission completion bonus
  const completionXp = Math.round(input.missionXpReward * (input.accuracy / 100));
  events.push({ source: 'mission-complete', amount: completionXp, label: 'Mission completion bonus' });

  // Boss bonus
  if (input.missionType === 'boss' && input.accuracy >= 70) {
    events.push({ source: 'boss-clear', amount: 100, label: 'Boss defeated! 🎯' });
  }

  // Compute raw total
  const rawTotal = events.reduce((sum, e) => sum + e.amount, 0);

  // Diminishing returns for easy-mission spam (>2 same zone plays today)
  let multiplier = 1;
  if (input.sameZonePlaysToday >= 3 && input.missionType === 'learn') multiplier = 0.3;
  else if (input.sameZonePlaysToday === 2 && input.missionType === 'learn') multiplier = 0.6;

  // Minimum XP: always get 20% of mission reward for completing
  const minimum = Math.round(input.missionXpReward * 0.2);
  const total = Math.max(minimum, Math.round(rawTotal * multiplier));

  return { total, events };
}

/* ══ Zone Mastery Scoring ════════════════════════════════════════ */
export function computeZoneMastery(
  zoneId: string,
  elementMastery: Record<number, ElementMastery>
): { masteryScore: number; coverageCount: number } {
  const zone = ZONE_MAP[zoneId];
  if (!zone) return { masteryScore: 0, coverageCount: 0 };

  // We don't have easy access to element atomic numbers per zone here,
  // so we rely on the caller (progressionStorage) to pass the filtered list.
  // This function is a simplified scorer based on available mastery data.
  const masteries = Object.values(elementMastery);
  if (masteries.length === 0) return { masteryScore: 0, coverageCount: 0 };

  const attempted = masteries.filter(m => m.totalAttempts > 0);
  const avgAccuracy = attempted.length > 0
    ? attempted.reduce((sum, m) => sum + m.accuracy, 0) / attempted.length
    : 0;

  return { masteryScore: Math.round(avgAccuracy), coverageCount: attempted.length };
}

/* ══ Boss Unlock Check ═══════════════════════════════════════════ */
export function isBossUnlocked(zoneProgress: ZoneProgress, playerLevel: number): boolean {
  const coverageRatio = zoneProgress.totalElements > 0
    ? zoneProgress.coverageCount / zoneProgress.totalElements
    : 0;
  return (
    playerLevel >= 5 &&
    coverageRatio >= 0.75 &&
    zoneProgress.masteryScore >= 65
  );
}

/* ══ Badge Resolution ════════════════════════════════════════════ */
export function resolveBadges(
  progress: PlayerProgress,
  missionResult: Pick<MissionResult, 'accuracy' | 'bestStreak' | 'type' | 'zoneId' | 'comebackElements'>
): BadgeId[] {
  const newBadges: BadgeId[] = [];
  const earned = new Set(progress.earnedBadges);

  if (!earned.has('first-quiz')) newBadges.push('first-quiz');
  if (missionResult.accuracy === 100 && !earned.has('perfect-run')) newBadges.push('perfect-run');
  if (missionResult.comebackElements.length >= 3 && !earned.has('comeback-king')) newBadges.push('comeback-king');
  if (missionResult.type === 'speed' && missionResult.accuracy >= 80 && !earned.has('speed-demon')) newBadges.push('speed-demon');
  if (missionResult.type === 'boss' && missionResult.accuracy >= 70) {
    const bossBadge = `boss-cleared-${missionResult.zoneId}` as BadgeId;
    if (!earned.has(bossBadge)) newBadges.push(bossBadge);
  }

  return newBadges;
}

/* ══ Level-Up Rewards ════════════════════════════════════════════ */
export function resolveLevelUpRewards(fromLevel: number, toLevel: number): RewardUnlock[] {
  const rewards: RewardUnlock[] = [];
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const config = LEVEL_TABLE.find(l => l.level === lvl);
    if (!config) continue;

    for (const mType of config.unlocks) {
      rewards.push({
        type: 'mission-type',
        value: mType,
        label: `${mType.charAt(0).toUpperCase() + mType.slice(1)} missions unlocked`,
        description: config.rewardLabel ?? '',
      });
    }
    if (lvl === 4 || lvl === 9) {
      rewards.push({ type: 'hint-tokens', value: 2, label: '+2 Hint Tokens', description: 'Use hints to reveal clues' });
    }
    if (lvl === 6) {
      rewards.push({ type: 'retry-shield', value: 1, label: '+1 Retry Shield', description: 'Shield yourself from a wrong answer' });
    }
    if (lvl === 8) {
      rewards.push({ type: 'streak-freeze', value: 1, label: '+1 Streak Freeze', description: 'Protect your streak for one missed day' });
    }
  }
  return rewards;
}

/* ══ Daily Mission Generation ════════════════════════════════════ */
// Deterministic: same date always produces same missions
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashDate(dateStr: string): number {
  let hash = 0;
  for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return hash >>> 0;
}

export function generateDailyMissions(
  date: string,
  playerLevel: number,
  weakZoneId: string | null,
): DailyMissionSet {
  const rng = seededRandom(hashDate(date));
  const allZones = ZONE_DEFINITIONS.filter(z => z.order <= 4 || playerLevel >= 3);
  const pick = (arr: ZoneDefinition[]) => arr[Math.floor(rng() * arr.length)];

  // Mission 1: Easy win — learn from an early zone
  const easyZones = ZONE_DEFINITIONS.filter(z => z.order <= 3);
  const easyZone = pick(easyZones);
  const easyMissions = buildMissionsForZone(easyZone);
  const m1 = easyMissions.find(m => m.type === 'learn')!;

  // Mission 2: Weak repair — recovery if weak zone exists, else practice
  const repairZone = weakZoneId ? ZONE_MAP[weakZoneId] : pick(allZones);
  const repairMissions = buildMissionsForZone(repairZone);
  const m2Type: MissionType = weakZoneId && playerLevel >= 2 ? 'recovery' : 'practice';
  const m2 = repairMissions.find(m => m.type === m2Type) ?? repairMissions[1];

  // Mission 3: Challenge — speed or practice from a random zone
  const challengeZone = pick(allZones.filter(z => z.id !== easyZone.id));
  const challengeMissions = buildMissionsForZone(challengeZone);
  const m3Type: MissionType = playerLevel >= 3 ? 'speed' : 'practice';
  const m3 = challengeMissions.find(m => m.type === m3Type) ?? challengeMissions[1];

  // Override ids to mark them as daily variants (so they don't double-count zone plays)
  const daily1: MissionDefinition = { ...m1, id: `daily-easy-${date}` };
  const daily2: MissionDefinition = { ...m2, id: `daily-weak-${date}` };
  const daily3: MissionDefinition = { ...m3, id: `daily-challenge-${date}` };

  return { date, missions: [daily1, daily2, daily3], completedIds: [] };
}

/* ══ Streak Freeze Application ═══════════════════════════════════ */
export function shouldApplyStreakFreeze(
  lastDate: string | null,
  today: string,
  freezeCount: number
): boolean {
  if (!lastDate || freezeCount <= 0) return false;
  const last = new Date(lastDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
  return diffDays === 1; // exactly one day missed
}

/* ══ Zone Completion Check ═══════════════════════════════════════ */
export function isZoneCleared(zp: ZoneProgress): boolean {
  return (
    zp.visitedMissions.includes('learn') &&
    zp.visitedMissions.includes('practice') &&
    zp.bossCleared
  );
}

/* ══ Recommended Action Label ════════════════════════════════════ */
export function getRecommendedAction(
  progress: PlayerProgress,
  allZoneProgress: Record<string, ZoneProgress>
): string {
  // Daily missions pending?
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastDailyMissionDate !== today) return 'Complete today\'s Daily Lab missions!';

  // Any boss just unlocked?
  const bossReady = Object.values(allZoneProgress).find(
    zp => zp.bossUnlocked && !zp.bossCleared
  );
  if (bossReady) {
    const zone = ZONE_MAP[bossReady.zoneId];
    return `Boss unlocked: ${zone?.label ?? 'Zone'} Boss Battle ready!`;
  }

  // Active zone incomplete?
  const activeZp = progress.activeZoneId ? allZoneProgress[progress.activeZoneId] : null;
  if (activeZp && !isZoneCleared(activeZp)) {
    const zone = ZONE_MAP[activeZp.zoneId];
    const pct = activeZp.totalElements > 0
      ? Math.round((activeZp.coverageCount / activeZp.totalElements) * 100)
      : 0;
    return `Continue ${zone?.label ?? 'your zone'} — ${pct}% complete`;
  }

  return 'Explore a new zone!';
}
