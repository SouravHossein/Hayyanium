'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import { allElementsData } from '@/data/elements';
import { DEFAULT_QUIZ_CONFIG } from '@/lib/quiz/quizEngine';
import {
  getPlayerProgress,
  getAllZoneProgress,
  getDailyMissions,
} from '@/lib/quiz/progressionStorage';
import { getStreak } from '@/lib/quiz/quizStorage';
import { getRecommendedAction, computeLevel, LEVEL_TABLE } from '@/lib/quiz/progressionEngine';
import { ZONE_DEFINITIONS } from '@/data/zones';
import { PlayerProgress, ZoneProgress, DailyMissionSet, MissionType } from '@/types/progressionTypes';

import PlayerXpBar from '@/components/quiz/PlayerXpBar';
import ZoneCard from '@/components/quiz/ZoneCard';
import BossCard from '@/components/quiz/BossCard';
import DailyMissionCard from '@/components/quiz/DailyMissionCard';

import { Map, FlaskConical, Skull, Compass, ArrowLeft, Rocket, Zap } from '@/components/icons';

type Tab = 'story' | 'daily' | 'boss';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'story', label: 'Story Path', icon: Map },
  { id: 'daily', label: 'Daily Lab', icon: FlaskConical },
  { id: 'boss', label: 'Boss Battles', icon: Skull },
];

export default function QuizAcademyPage() {
  const router = useRouter();
  const { startQuiz } = useQuiz();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('story');
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [allZp, setAllZp] = useState<Record<string, ZoneProgress>>({});
  const [daily, setDaily] = useState<DailyMissionSet | null>(null);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    router.replace('/quiz/setup');
  }, [router]);

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

  const handleQuickStart = () => {
    const config = {
      ...DEFAULT_QUIZ_CONFIG,
      questionCount: 10,
      difficulty: 'normal' as const,
      shuffleQuestions: true,
    };
    startQuiz(config, allElementsData);
    router.push('/quiz/play');
  };

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
        href="/"
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Table
      </Link>

      {/* ── Recommended Action Banner ─────────────────────────── */}
      {/* 
      <div className="card bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-5 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Compass className="w-24 h-24" />
        </div>
        <div className="rounded-xl bg-blue-500 p-2.5 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
          <Compass className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Guided Path</p>
          <p className="font-black text-lg leading-tight mt-0.5 text-gray-900 dark:text-white">{recommendedAction}</p>
        </div>
        <Link
          href="/quiz/setup"
          className="retro-btn bg-[var(--color-actinide)] px-4 py-2 text-xs font-black"
        >
          EXPLORE
        </Link>
      </div>
      */}

      {/* ── Quick Start & XP Overview ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quick Start Card */}
        <button
          onClick={handleQuickStart}
          className="card p-5 bg-gradient-to-br from-amber-400/10 to-orange-500/10 flex items-center gap-4 text-left group"
        >
          <div className="rounded-xl bg-amber-400 p-2.5 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] group-hover:rotate-12 transition-transform">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Quick Start</h3>
            <p className="text-xs font-bold opacity-70">10 Random Questions · Normal Mode</p>
          </div>
          <Zap className="w-5 h-5 text-amber-500 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
        </button>

        {/* XP Overview */}
        {/* 
        {progress && (
          <div className="card p-4">
            <PlayerXpBar
              xp={progress.playerXp}
              level={progress.playerLevel}
              rank={progress.playerRank}
              animate={false}
            />
          </div>
        )}
        */}
      </div>

      {/* ── Tab Navigation ────────────────────────────────────── */}
      {/* 
      <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border-2 border-[var(--color-retro-stroke)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all
              ${tab === t.id
                ? 'bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] shadow-[2px_2px_0px_var(--shadow-color)] -translate-y-0.5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5'
              }`}
          >
            <t.icon className={`w-4 h-4 ${tab === t.id ? 'animate-pulse' : 'opacity-60'}`} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      */}

      {/* ── Story Path Tab ────────────────────────────────────── */}
      {/* 
      {tab === 'story' && progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Zone Campaign</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Object.values(allZp).filter(z => z.bossCleared).length} / {ZONE_DEFINITIONS.length} cleared
            </span>
          </div>

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
      */}

      {/* ── Daily Lab Tab ──────────────────────────────────────── */}
      {/* 
      {tab === 'daily' && daily && progress && (
        <div>
          <DailyMissionCard
            dailySet={daily}
            streakCount={streak.current}
            streakFreezeCount={progress.streakFreezeCount}
          />
        </div>
      )}
      */}

      {/* ── Boss Battles Tab ───────────────────────────────────── */}
      {/* 
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
      */}

      {/* ── Laboratory Tools ────────────────────────────────────── */}
      <div className="card p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700">
            <Zap className="w-4 h-4 text-gray-500" />
          </div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">Laboratory Tools</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Setup', icon: '⚙️', href: '/quiz/setup', color: 'hover:border-cyan-400 hover:text-cyan-600' },
            { label: 'History', icon: '📊', href: '/quiz/history', color: 'hover:border-blue-400 hover:text-blue-600' },
            { label: 'Weakness', icon: '💊', href: '/quiz/setup?scope=weak', color: 'hover:border-purple-400 hover:text-purple-600' },
            { label: 'Profile', icon: '🏅', href: '/profile', color: 'hover:border-amber-400 hover:text-amber-600' },
          ].map(tool => (
            <Link
              key={tool.label}
              href={tool.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-black transition-all active:scale-95 ${tool.color}`}
            >
              <span className="text-xl">{tool.icon}</span>
              <span className="uppercase tracking-tighter">{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
