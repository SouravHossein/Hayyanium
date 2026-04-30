/* ── Progression Storage ─────────────────────────────────────────
   Persistence layer for player progression, zone progress, daily
   missions, and boss states. All existing quiz storage keys remain
   unchanged for full backward compatibility.
────────────────────────────────────────────────────────────────── */

import {
  PlayerProgress,
  ZoneProgress,
  DailyMissionSet,
  BossState,
  MissionResult,
  RewardUnlock,
  DEFAULT_PLAYER_PROGRESS,
  MissionType,
} from '../../types/progressionTypes';
import {
  computeLevel,
  calculateXp,
  resolveBadges,
  resolveLevelUpRewards,
  isBossUnlocked,
  shouldApplyStreakFreeze,
  generateDailyMissions,
  isZoneCleared,
  LEVEL_TABLE,
} from './progressionEngine';
import { getPerElementMastery, getWeakElements, getStreak } from './quizStorage';
import { ZONE_DEFINITIONS, ZONE_MAP, buildMissionsForZone } from '../../data/zones';
import { allElementsData } from '../../data/elements';

/* ── Storage keys ────────────────────────────────────────────────── */
const PROGRESSION_KEY  = 'hayyanium_progression';
const ZONE_KEY         = 'hayyanium_zone_progress';
const DAILY_KEY        = 'hayyanium_daily';
const BOSS_KEY         = 'hayyanium_boss_states';
const ZONE_PLAYS_KEY   = 'hayyanium_zone_plays_today'; // { date, plays: Record<zoneId, count> }

/* ══ Player Progress ════════════════════════════════════════════ */
export function getPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    if (raw) return { ...DEFAULT_PLAYER_PROGRESS, ...JSON.parse(raw) };
  } catch { /* empty */ }
  return { ...DEFAULT_PLAYER_PROGRESS };
}

export function savePlayerProgress(p: PlayerProgress): void {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(p));
}

/* ══ Zone Progress ══════════════════════════════════════════════ */
function getAllZoneProgressRaw(): Record<string, ZoneProgress> {
  try {
    const raw = localStorage.getItem(ZONE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getAllZoneProgress(): Record<string, ZoneProgress> {
  const stored = getAllZoneProgressRaw();
  // Ensure every zone has a record (fill defaults)
  const result: Record<string, ZoneProgress> = {};
  for (const zone of ZONE_DEFINITIONS) {
    result[zone.id] = stored[zone.id] ?? {
      zoneId: zone.id,
      visitedMissions: [],
      masteryScore: 0,
      coverageCount: 0,
      totalElements: zone.totalElements,
      bossUnlocked: false,
      bossCleared: false,
      badgeEarned: false,
    };
  }
  return result;
}

export function getZoneProgress(zoneId: string): ZoneProgress {
  return getAllZoneProgress()[zoneId] ?? {
    zoneId,
    visitedMissions: [],
    masteryScore: 0,
    coverageCount: 0,
    totalElements: ZONE_MAP[zoneId]?.totalElements ?? 0,
    bossUnlocked: false,
    bossCleared: false,
    badgeEarned: false,
  };
}

function saveAllZoneProgress(all: Record<string, ZoneProgress>): void {
  localStorage.setItem(ZONE_KEY, JSON.stringify(all));
}

/* ══ Daily Missions ══════════════════════════════════════════════ */
export function getDailyMissions(): DailyMissionSet {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) {
      const stored: DailyMissionSet = JSON.parse(raw);
      if (stored.date === today) return stored;
    }
  } catch { /* empty */ }

  // Generate fresh daily set
  const progress = getPlayerProgress();
  const weakEls = getWeakElements();
  // Find zone with most weak elements
  let weakZoneId: string | null = null;
  let maxWeak = 0;
  for (const zone of ZONE_DEFINITIONS) {
    const zoneElements = allElementsData.filter(e => {
      if (zone.scopeType === 'period') return e.period === zone.scopeValue;
      if (zone.scopeType === 'block')  return e.block.toLowerCase() === String(zone.scopeValue).toLowerCase();
      if (zone.scopeType === 'category') return e.category.toLowerCase() === String(zone.scopeValue).toLowerCase();
      return false;
    }).map(e => e.atomicNumber);
    const weakCount = zoneElements.filter(n => weakEls.includes(n)).length;
    if (weakCount > maxWeak) { maxWeak = weakCount; weakZoneId = zone.id; }
  }

  const daily = generateDailyMissions(today, progress.playerLevel, weakZoneId);
  localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  return daily;
}

export function markDailyMissionComplete(missionId: string): void {
  const daily = getDailyMissions();
  if (!daily.completedIds.includes(missionId)) {
    daily.completedIds.push(missionId);
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  }
}

/* ══ Boss States ════════════════════════════════════════════════ */
export function getAllBossStates(): Record<string, BossState> {
  try {
    const raw = localStorage.getItem(BOSS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getBossState(bossId: string): BossState {
  return getAllBossStates()[bossId] ?? { bossId, zoneId: '', cleared: false };
}

function saveBossState(state: BossState): void {
  const all = getAllBossStates();
  all[state.bossId] = state;
  localStorage.setItem(BOSS_KEY, JSON.stringify(all));
}

/* ══ Zone Play Count (diminishing returns) ══════════════════════ */
function getZonePlaysToday(): Record<string, number> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(ZONE_PLAYS_KEY);
    if (raw) {
      const { date, plays } = JSON.parse(raw);
      if (date === today) return plays;
    }
  } catch { /* empty */ }
  return {};
}

function incrementZonePlay(zoneId: string): number {
  const today = new Date().toISOString().split('T')[0];
  const plays = getZonePlaysToday();
  plays[zoneId] = (plays[zoneId] ?? 0) + 1;
  localStorage.setItem(ZONE_PLAYS_KEY, JSON.stringify({ date: today, plays }));
  return plays[zoneId];
}

/* ══ Recompute Zone Mastery from Element Mastery ════════════════ */
function recomputeZoneProgress(
  zoneId: string,
  existing: ZoneProgress,
  playerLevel: number
): ZoneProgress {
  const zone = ZONE_MAP[zoneId];
  if (!zone) return existing;

  const elMastery = getPerElementMastery();
  const zoneAtomicNums = allElementsData.filter(e => {
    if (zone.scopeType === 'period') return e.period === zone.scopeValue;
    if (zone.scopeType === 'block')  return e.block.toLowerCase() === String(zone.scopeValue).toLowerCase();
    if (zone.scopeType === 'category') return e.category.toLowerCase() === String(zone.scopeValue).toLowerCase();
    return false;
  }).map(e => e.atomicNumber);

  const attempted = zoneAtomicNums.filter(n => elMastery[n] && elMastery[n].totalAttempts > 0);
  const avgAcc = attempted.length > 0
    ? attempted.reduce((sum, n) => sum + (elMastery[n]?.accuracy ?? 0), 0) / attempted.length
    : 0;

  const updated: ZoneProgress = {
    ...existing,
    coverageCount: attempted.length,
    masteryScore: Math.round(avgAcc),
    totalElements: zoneAtomicNums.length,
  };
  updated.bossUnlocked = isBossUnlocked(updated, playerLevel);
  return updated;
}

/* ══ Core: Apply Mission Result ═════════════════════════════════ */
export function applyMissionResult(
  quizResult: {
    correctCount: number;
    totalQuestions: number;
    accuracy: number;
    bestStreak: number;
    weakElements: number[];
    answers: { isCorrect: boolean; questionId: string }[];
  },
  missionId: string,
  zoneId: string,
  missionType: MissionType,
  missionXpReward: number,
): { missionResult: MissionResult; rewards: RewardUnlock[] } {
  /* ── Load current state ─────────────────────────────────────── */
  let progress = getPlayerProgress();
  const allZp = getAllZoneProgress();
  const zp = allZp[zoneId] ?? getZoneProgress(zoneId);
  const elMastery = getPerElementMastery();

  /* ── Find comeback elements (were weak before this quiz) ───── */
  // weakElements in the result = elements that were wrong in THIS session
  // comeback = elements that WERE previously weak but got RIGHT this session
  const previousWeak = new Set(getWeakElements());
  const comebackElements: number[] = [];
  // We can't directly map answers to atomicNumbers in this generic fn,
  // so comebackElements is filled from what WAS weak and is NOT in current weak
  // (detected after trackElementAnswer has been called by the play page)
  const newWeak = new Set(quizResult.weakElements);
  for (const n of previousWeak) {
    if (!newWeak.has(n)) comebackElements.push(n);
  }

  /* ── Count same-zone plays today ──────────────────────────── */
  const sameZonePlaysToday = getZonePlaysToday()[zoneId] ?? 0;

  /* ── Count newly mastered elements ─────────────────────────── */
  const newMasteredElements = Object.values(elMastery)
    .filter(m => m.status === 'mastered' && m.totalAttempts <= 3) // proxy for "just mastered"
    .length;

  /* ── Calculate XP ─────────────────────────────────────────── */
  const { total: xpEarned, events: xpEvents } = calculateXp({
    correctCount: quizResult.correctCount,
    totalCount: quizResult.totalQuestions,
    bestStreak: quizResult.bestStreak,
    missionType,
    missionXpReward,
    newMasteredElements,
    comebackElements: comebackElements.length,
    sameZonePlaysToday,
    accuracy: quizResult.accuracy,
  });

  /* ── Apply XP and check level-up ──────────────────────────── */
  const oldLevel = progress.playerLevel;
  progress.playerXp += xpEarned;
  const { level: newLevel, rank: newRank } = computeLevel(progress.playerXp);
  const leveledUp = newLevel > oldLevel;

  /* ── Unlock new mission types on level-up ─────────────────── */
  if (leveledUp) {
    for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
      const lc = LEVEL_TABLE.find(l => l.level === lvl);
      if (lc) {
        for (const mt of lc.unlocks) {
          if (!progress.unlockedMissionTypes.includes(mt)) {
            progress.unlockedMissionTypes.push(mt);
          }
        }
      }
    }
    // Level 8 → streak freeze
    if (oldLevel < 8 && newLevel >= 8) progress.streakFreezeCount++;
    // Level 6 → retry shield
    if (oldLevel < 6 && newLevel >= 6) progress.retryShields++;
    // Level 4 / 9 → hints
    if ((oldLevel < 4 && newLevel >= 4) || (oldLevel < 9 && newLevel >= 9)) progress.hintsRemaining += 2;
  }

  progress.playerLevel = newLevel;
  progress.playerRank = newRank;

  /* ── Resolve badges ───────────────────────────────────────── */
  const newBadges = resolveBadges(progress, {
    accuracy: quizResult.accuracy,
    bestStreak: quizResult.bestStreak,
    type: missionType,
    zoneId,
    comebackElements,
  });
  progress.earnedBadges = [...new Set([...progress.earnedBadges, ...newBadges])];

  /* ── Update zone progress ─────────────────────────────────── */
  const updatedZp = recomputeZoneProgress(zoneId, zp, newLevel);
  if (!updatedZp.visitedMissions.includes(missionType)) {
    updatedZp.visitedMissions = [...updatedZp.visitedMissions, missionType];
  }
  if (missionType === 'boss' && quizResult.accuracy >= 60) {
    updatedZp.bossCleared = true;
    progress.unlockedBossIds = [...new Set([...progress.unlockedBossIds, zoneId])];
    // Unlock next zone
    const currentZone = ZONE_MAP[zoneId];
    if (currentZone) {
      const nextZone = ZONE_DEFINITIONS.find(z => z.order === currentZone.order + 1);
      if (nextZone && !progress.activeZoneId) progress.activeZoneId = nextZone.id;
    }
  }
  if (isZoneCleared(updatedZp) && !updatedZp.badgeEarned) {
    updatedZp.badgeEarned = true;
    const zoneBadge = `zone-cleared-${zoneId}`;
    if (!progress.earnedBadges.includes(zoneBadge)) progress.earnedBadges.push(zoneBadge);
  }
  allZp[zoneId] = updatedZp;

  /* ── Streak (meaningful completion = ≥1 daily mission done) ── */
  const today = new Date().toISOString().split('T')[0];
  const daily = getDailyMissions();
  const isDaily = daily.missions.some(m => m.id === missionId);
  if (isDaily) {
    markDailyMissionComplete(missionId);
    progress.lastDailyMissionDate = today;
  }

  /* ── Weekly goal ─────────────────────────────────────────── */
  const wg = progress.weeklyGoalProgress;
  if (!wg.weekStart) {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    wg.weekStart = monday.toISOString().split('T')[0];
  }
  wg.elementsMastered += newMasteredElements;
  if (isZoneCleared(updatedZp)) wg.zonesCleared = Math.min(wg.zonesCleared + 1, 99);
  if (missionType === 'boss' && quizResult.accuracy >= 60) wg.bossesBeaten++;

  /* ── Boss state ──────────────────────────────────────────── */
  if (missionType === 'boss') {
    saveBossState({
      bossId: `boss-${zoneId}`,
      zoneId,
      cleared: quizResult.accuracy >= 60,
      clearedDate: today,
      bestAccuracy: quizResult.accuracy,
    });
  }

  /* ── Increment zone play count ───────────────────────────── */
  incrementZonePlay(zoneId);

  /* ── Persist ─────────────────────────────────────────────── */
  savePlayerProgress(progress);
  saveAllZoneProgress(allZp);

  /* ── Build rewards list ──────────────────────────────────── */
  const rewards: RewardUnlock[] = resolveLevelUpRewards(oldLevel, newLevel);
  for (const badge of newBadges) {
    rewards.push({ type: 'badge', value: badge, label: `Badge: ${badge}`, description: '' });
  }

  /* ── Build MissionResult ─────────────────────────────────── */
  const missionResult: MissionResult = {
    missionId,
    zoneId,
    type: missionType,
    date: today,
    xpEarned,
    accuracy: quizResult.accuracy,
    bestStreak: quizResult.bestStreak,
    newBadges,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    newRank: leveledUp ? newRank : undefined,
    comebackElements,
  };

  return { missionResult, rewards };
}

/* ══ Streak Freeze Check (call at app load) ═════════════════════ */
export function applyStreakFreezeIfNeeded(): void {
  const progress = getPlayerProgress();
  const today = new Date().toISOString().split('T')[0];
  const streak = getStreak();

  if (
    streak.current > 0 &&
    progress.streakFreezeCount > 0 &&
    shouldApplyStreakFreeze(progress.lastDailyMissionDate, today, progress.streakFreezeCount)
  ) {
    progress.streakFreezeCount--;
    progress.lastDailyMissionDate = today; // count today as "covered"
    savePlayerProgress(progress);
  }
}

/* ══ Clear all progression data ═════════════════════════════════ */
export function clearProgressionData(): void {
  localStorage.removeItem(PROGRESSION_KEY);
  localStorage.removeItem(ZONE_KEY);
  localStorage.removeItem(DAILY_KEY);
  localStorage.removeItem(BOSS_KEY);
  localStorage.removeItem(ZONE_PLAYS_KEY);
}
