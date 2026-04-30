'use client';

import React from 'react';
import Link from 'next/link';
import { ZoneDefinition, ZoneProgress } from '@/types/progressionTypes';
import { Skull, CheckCircle2, Lock } from '@/components/icons';

interface BossCardProps {
  zone: ZoneDefinition;
  zoneProgress: ZoneProgress;
  playerLevel: number;
}

export default function BossCard({ zone, zoneProgress, playerLevel }: BossCardProps) {
  const { bossUnlocked, bossCleared, masteryScore, coverageCount, totalElements } = zoneProgress;
  const coveragePct = totalElements > 0 ? Math.round((coverageCount / totalElements) * 100) : 0;
  const bossId = `${zone.id}-boss`;

  if (bossCleared) {
    return (
      <div className="rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 p-4 flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
        <div className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{zone.label}</div>
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">BOSS CLEARED</div>
        <Link
          href={`/quiz/mission/${bossId}`}
          className="mt-1 text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors"
        >
          Rematch
        </Link>
      </div>
    );
  }

  if (bossUnlocked) {
    return (
      <Link
        href={`/quiz/mission/${bossId}`}
        className="group rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 p-4 flex flex-col items-center gap-2 text-center transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-200 dark:hover:shadow-amber-900 active:scale-[0.97]"
      >
        <Skull className="w-10 h-10 text-red-500 fill-red-500/20 animate-bounce" />
        <div className="font-bold text-sm text-amber-800 dark:text-amber-200">{zone.label}</div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-white font-black animate-pulse">
          BOSS READY!
        </span>
        <p className="text-[10px] text-amber-700 dark:text-amber-400">Tap to challenge</p>
      </Link>
    );
  }

  // Locked
  const needsCoverage = coveragePct < 75;
  const needsMastery = masteryScore < 65;
  const needsLevel = playerLevel < 5;

  return (
    <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 flex flex-col items-center gap-2 text-center opacity-70">
      <div className="relative">
        <Skull className="w-10 h-10 text-gray-400 grayscale" />
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
          <Lock className="w-3 h-3 text-gray-400" />
        </div>
      </div>
      <div className="font-bold text-sm text-gray-600 dark:text-gray-400">{zone.label}</div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold">
        🔒 LOCKED
      </span>
      <div className="text-[10px] text-gray-400 dark:text-gray-500 space-y-0.5">
        {needsLevel && <p>Reach Level 5</p>}
        {needsCoverage && <p>Coverage: {coveragePct}% / 75%</p>}
        {needsMastery && !needsCoverage && <p>Mastery: {masteryScore}% / 65%</p>}
      </div>
      {/* Mini progress bars */}
      {!needsLevel && (
        <div className="w-full space-y-1 mt-1">
          <div>
            <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
              <span>Coverage</span><span>{coveragePct}%</span>
            </div>
            <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all" style={{ width: `${Math.min(coveragePct, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
              <span>Mastery</span><span>{masteryScore}%</span>
            </div>
            <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full bg-purple-400 transition-all" style={{ width: `${Math.min(masteryScore, 100)}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
