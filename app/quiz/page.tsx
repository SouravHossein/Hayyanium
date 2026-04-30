'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PlayerProgress,
  ZoneProgress,
  DailyMissionSet,
  MissionType,
} from '@/types/progressionTypes';
import {
  getPlayerProgress,
  getAllZoneProgress,
  getDailyMissions,
} from '@/lib/quiz/progressionStorage';
import { getStreak } from '@/lib/quiz/quizStorage';
import { getRecommendedAction, computeLevel, LEVEL_TABLE } from '@/lib/quiz/progressionEngine';
import { ZONE_DEFINITIONS } from '@/data/zones';

import PlayerXpBar from '@/components/quiz/PlayerXpBar';
import ZoneCard from '@/components/quiz/ZoneCard';
import BossCard from '@/components/quiz/BossCard';
import DailyMissionCard from '@/components/quiz/DailyMissionCard';

import { Map, FlaskConical, Skull, Compass, ArrowLeft } from '@/components/icons';

type Tab = 'story' | 'daily' | 'boss';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'story', label: 'Story Path', icon: Map },
  { id: 'daily', label: 'Daily Lab', icon: FlaskConical },
  { id: 'boss', label: 'Boss Battles', icon: Skull },
];

export default function QuizAcademyPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('story');
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [allZp, setAllZp] = useState<Record<string, ZoneProgress>>({});
  const [daily, setDaily] = useState<DailyMissionSet | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    setMounted(true);
    const p = getPlayerProgress();
    const zp = getAllZoneProgress();
    const d = getDailyMissions();
    const s = getStreak();
    setProgress(p);
    setAllZp(zp);
    setDaily(d);
    setStreak(s);
  }, []);

  const recommendedAction = useMemo(() => {
    if (!progress) return 'Welcome to the Quiz Academy!';
    return getRecommendedAction(progress, allZp);
  }, [progress, allZp]);

  const { xpIntoLevel, xpForNext } = mounted && progress
    ? computeLevel(progress.playerXp)
    : { xpIntoLevel: 0, xpForNext: 150 };

  const nextLevelXp = progress
    ? (LEVEL_TABLE.find(l => l.level === progress.playerLevel + 1)?.xpRequired ?? progress.playerXp)
    : 150;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <Link
        href="/quiz/setup"
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
      </Link>

      {/* ── Recommended Action Banner ─────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-4 text-white flex items-center gap-3 shadow-lg shadow-blue-200 dark:shadow-blue-900">
        <Compass className="w-8 h-8 text-white flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Recommended</p>
          <p className="font-bold text-sm leading-snug">{recommendedAction}</p>
        </div>
        <Link
          href="/quiz/setup"
          className="flex-shrink-0 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-bold transition-colors"
        >
          Free Play →
        </Link>
      </div>

      {/* ── Player XP Bar ─────────────────────────────────────── */}
      {progress && (
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <PlayerXpBar
            xp={progress.playerXp}
            level={progress.playerLevel}
            rank={progress.playerRank}
            animate={false}
          />
        </div>
      )}

      {/* ── Tab Navigation ────────────────────────────────────── */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all
              ${tab === t.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm shadow-black/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-blue-500' : 'opacity-60'}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Story Path Tab ────────────────────────────────────── */}
      {tab === 'story' && progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Zone Campaign</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Object.values(allZp).filter(z => z.bossCleared).length} / {ZONE_DEFINITIONS.length} cleared
            </span>
          </div>

          {/* Period zones first, then blocks, then categories */}
          {(['period', 'block', 'category'] as const).map(scopeType => {
            const zones = ZONE_DEFINITIONS.filter(z => z.scopeType === scopeType);
            const sectionLabel = scopeType === 'period' ? '📅 Period Tracks'
              : scopeType === 'block' ? '🔷 Block Tracks' : '🏷️ Category Tracks';
            return (
              <div key={scopeType} className="space-y-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">{sectionLabel}</p>
                {zones.map(zone => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    zoneProgress={allZp[zone.id] ?? { zoneId: zone.id, visitedMissions: [], masteryScore: 0, coverageCount: 0, totalElements: zone.totalElements, bossUnlocked: false, bossCleared: false, badgeEarned: false }}
                    playerLevel={progress.playerLevel}
                    unlockedMissionTypes={progress.unlockedMissionTypes as MissionType[]}
                    isActive={zone.id === progress.activeZoneId}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Daily Lab Tab ──────────────────────────────────────── */}
      {tab === 'daily' && daily && progress && (
        <div>
          <DailyMissionCard
            dailySet={daily}
            streakCount={streak.current}
            streakFreezeCount={progress.streakFreezeCount}
          />
        </div>
      )}

      {/* ── Boss Battles Tab ───────────────────────────────────── */}
      {tab === 'boss' && progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Boss Battles</h2>
            {progress.playerLevel < 5 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full px-2 py-0.5 font-semibold">
                Reach Level 5 to unlock
              </span>
            )}
          </div>

          {/* Grid of boss cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ZONE_DEFINITIONS.map(zone => (
              <BossCard
                key={zone.id}
                zone={zone}
                zoneProgress={allZp[zone.id] ?? { zoneId: zone.id, visitedMissions: [], masteryScore: 0, coverageCount: 0, totalElements: zone.totalElements, bossUnlocked: false, bossCleared: false, badgeEarned: false }}
                playerLevel={progress.playerLevel}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Quick free-play shortcut ────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Start</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/quiz/setup"
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all active:scale-95"
          >
            ⚙️ <span>Custom Setup</span>
          </Link>
          <Link
            href="/quiz/history"
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all active:scale-95"
          >
            📊 <span>History</span>
          </Link>
          <Link
            href="/quiz/setup?scope=weak"
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all active:scale-95"
          >
            💊 <span>Weak Elements</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all active:scale-95"
          >
            🏅 <span>Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
