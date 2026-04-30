/* ── Zone & Mission Definitions ────────────────────────────────────
   Static data: all playable zones and their 5-mission template.
   ZoneDefinition.totalElements is pre-computed from elements data.
────────────────────────────────────────────────────────────────── */

import { ZoneDefinition, MissionDefinition } from '../types/progressionTypes';

/* ── Zone catalogue ─────────────────────────────────────────────── */
export const ZONE_DEFINITIONS: ZoneDefinition[] = [
  /* Period zones */
  { id: 'period-1', label: 'Period 1', scopeType: 'period', scopeValue: 1, icon: '⚡', color: 'from-sky-400 to-blue-500', order: 1, bossId: 'boss-period-1', totalElements: 2 },
  { id: 'period-2', label: 'Period 2', scopeType: 'period', scopeValue: 2, icon: '🔥', color: 'from-orange-400 to-red-500', order: 2, bossId: 'boss-period-2', totalElements: 8 },
  { id: 'period-3', label: 'Period 3', scopeType: 'period', scopeValue: 3, icon: '💧', color: 'from-cyan-400 to-teal-500', order: 3, bossId: 'boss-period-3', totalElements: 8 },
  { id: 'period-4', label: 'Period 4', scopeType: 'period', scopeValue: 4, icon: '⚗️', color: 'from-purple-400 to-indigo-500', order: 4, bossId: 'boss-period-4', totalElements: 18 },
  { id: 'period-5', label: 'Period 5', scopeType: 'period', scopeValue: 5, icon: '🌿', color: 'from-emerald-400 to-green-500', order: 5, bossId: 'boss-period-5', totalElements: 18 },
  { id: 'period-6', label: 'Period 6', scopeType: 'period', scopeValue: 6, icon: '🌑', color: 'from-slate-500 to-gray-700', order: 6, bossId: 'boss-period-6', totalElements: 32 },
  { id: 'period-7', label: 'Period 7', scopeType: 'period', scopeValue: 7, icon: '☢️', color: 'from-yellow-500 to-amber-600', order: 7, bossId: 'boss-period-7', totalElements: 32 },

  /* Block zones */
  { id: 'block-s', label: 's-Block', scopeType: 'block', scopeValue: 's', icon: '🔵', color: 'from-blue-400 to-blue-600', order: 8, bossId: 'boss-block-s', totalElements: 14 },
  { id: 'block-p', label: 'p-Block', scopeType: 'block', scopeValue: 'p', icon: '🟣', color: 'from-violet-400 to-purple-600', order: 9, bossId: 'boss-block-p', totalElements: 35 },
  { id: 'block-d', label: 'd-Block', scopeType: 'block', scopeValue: 'd', icon: '🟡', color: 'from-amber-400 to-yellow-600', order: 10, bossId: 'boss-block-d', totalElements: 40 },
  { id: 'block-f', label: 'f-Block', scopeType: 'block', scopeValue: 'f', icon: '🟢', color: 'from-lime-400 to-green-600', order: 11, bossId: 'boss-block-f', totalElements: 30 },

  /* Category zones */
  { id: 'cat-alkali', label: 'Alkali Metals', scopeType: 'category', scopeValue: 'alkali metal', icon: '⚡', color: 'from-yellow-400 to-orange-500', order: 12, bossId: 'boss-cat-alkali', totalElements: 6 },
  { id: 'cat-halogen', label: 'Halogens', scopeType: 'category', scopeValue: 'halogen', icon: '🧪', color: 'from-pink-400 to-rose-600', order: 13, bossId: 'boss-cat-halogen', totalElements: 6 },
  { id: 'cat-noble', label: 'Noble Gases', scopeType: 'category', scopeValue: 'noble gas', icon: '✨', color: 'from-indigo-300 to-purple-400', order: 14, bossId: 'boss-cat-noble', totalElements: 7 },
  { id: 'cat-transition', label: 'Transition Metals', scopeType: 'category', scopeValue: 'transition metal', icon: '⚙️', color: 'from-zinc-400 to-slate-600', order: 15, bossId: 'boss-cat-transition', totalElements: 38 },
];

export const ZONE_MAP: Record<string, ZoneDefinition> = Object.fromEntries(
  ZONE_DEFINITIONS.map(z => [z.id, z])
);

/* ── Mission template builder ───────────────────────────────────── */
export function buildMissionsForZone(zone: ZoneDefinition): MissionDefinition[] {
  const base = { zoneId: zone.id };
  const q = (count: number) => Math.min(count, zone.totalElements);

  return [
    {
      ...base,
      id: `${zone.id}-learn`,
      type: 'learn',
      label: `${zone.label} — Learn`,
      description: 'Gentle intro with multiple-choice questions',
      questionCount: q(5),
      timerEnabled: false,
      allowSkip: true,
      allowHint: true,
      xpReward: 40,
      unlockedAtLevel: 1,
    },
    {
      ...base,
      id: `${zone.id}-practice`,
      type: 'practice',
      label: `${zone.label} — Practice`,
      description: 'Mixed review to build confidence',
      questionCount: q(8),
      timerEnabled: false,
      allowSkip: true,
      allowHint: true,
      xpReward: 60,
      unlockedAtLevel: 1,
    },
    {
      ...base,
      id: `${zone.id}-speed`,
      type: 'speed',
      label: `${zone.label} — Speed Run`,
      description: 'Race against the clock — 15 s per question',
      questionCount: q(10),
      timerEnabled: true,
      timerSeconds: 15,
      allowSkip: false,
      allowHint: false,
      xpReward: 90,
      unlockedAtLevel: 3,
    },
    {
      ...base,
      id: `${zone.id}-recovery`,
      type: 'recovery',
      label: `${zone.label} — Recovery`,
      description: 'Rematches on your weakest elements in this zone',
      questionCount: q(6),
      timerEnabled: false,
      allowSkip: false,
      allowHint: true,
      xpReward: 80,
      unlockedAtLevel: 2,
    },
    {
      ...base,
      id: `${zone.id}-boss`,
      type: 'boss',
      label: `${zone.label} — BOSS`,
      description: 'Mixed formats, strict scoring, no skips',
      questionCount: q(10),
      timerEnabled: true,
      timerSeconds: 20,
      allowSkip: false,
      allowHint: false,
      xpReward: 200,
      unlockedAtLevel: 5,
    },
  ];
}

/* ── Mission map ─────────────────────────────────────────────────── */
// Lazy-build: call getMissionById when needed
let _missionCache: Record<string, MissionDefinition> | null = null;

export function getAllMissions(): Record<string, MissionDefinition> {
  if (_missionCache) return _missionCache;
  _missionCache = {};
  for (const zone of ZONE_DEFINITIONS) {
    for (const mission of buildMissionsForZone(zone)) {
      _missionCache[mission.id] = mission;
    }
  }
  return _missionCache;
}

export function getMissionById(id: string): MissionDefinition | null {
  return getAllMissions()[id] ?? null;
}

/* ── First open zone (always period-1) ──────────────────────────── */
export const STARTING_ZONE_ID = 'period-1';
