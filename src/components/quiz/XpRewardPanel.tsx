'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MissionResult, RewardUnlock } from '@/types/progressionTypes';
import { XpEvent } from '@/types/progressionTypes';
import { 
  Sparkles, Rocket, Map, Lock, Trophy, 
  Dumbbell, Star, GraduationCap, Medal, BadgeInfo 
} from '@/components/icons';

interface XpRewardPanelProps {
  missionResult: MissionResult;
  rewards: RewardUnlock[];
  xpEvents: XpEvent[];
  totalXpBefore: number;
}

export default function XpRewardPanel({ missionResult, rewards, xpEvents, totalXpBefore }: XpRewardPanelProps) {
  const [displayXp, setDisplayXp] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const target = missionResult.xpEarned;
    const duration = 1200;

    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayXp(Math.round(target * eased));
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [missionResult.xpEarned]);

  const badgeRewards = rewards.filter(r => r.type === 'badge');
  const featureRewards = rewards.filter(r => r.type !== 'badge');

  return (
    <div className="space-y-4">
      {/* XP earned hero */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white text-center shadow-lg shadow-amber-200 dark:shadow-amber-900">
        <p className="text-sm font-semibold opacity-80 mb-1">Experience Earned</p>
        <div className="text-5xl font-black tabular-nums">+{displayXp}</div>
        <p className="text-sm opacity-80 mt-1">XP</p>
      </div>

      {/* XP breakdown */}
      {xpEvents.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/80">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Breakdown</p>
          </div>
          {xpEvents.map((ev, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">{ev.label}</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">+{ev.amount}</span>
            </div>
          ))}
        </div>
      )}

      {/* Level-up banner */}
      {missionResult.leveledUp && (
        <div className="rounded-2xl border-2 border-purple-400 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/20 p-4 text-center">
          <div className="flex justify-center mb-1">
            <Sparkles className="w-10 h-10 text-purple-500 fill-purple-500/20 animate-pulse" />
          </div>
          <p className="font-black text-purple-700 dark:text-purple-300 text-lg">Level Up!</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">You reached <strong>Level {missionResult.newLevel}</strong>!</p>
          {missionResult.newRank && (
            <p className="text-sm text-purple-500 dark:text-purple-400 mt-0.5">New rank: <strong>{missionResult.newRank}</strong></p>
          )}
        </div>
      )}

      {/* Feature unlocks */}
      {featureRewards.length > 0 && (
        <div className="space-y-2">
          {featureRewards.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-3">
              <Lock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-bold text-sm text-blue-700 dark:text-blue-300">{r.label}</p>
                {r.description && <p className="text-xs text-blue-600 dark:text-blue-400">{r.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges earned */}
      {badgeRewards.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-3">Badges Earned</p>
          <div className="flex flex-wrap gap-3">
            {badgeRewards.map((r, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow">
                  <Medal className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 text-center max-w-[56px] leading-tight">
                  {r.label.replace('Badge: ', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comeback elements */}
      {missionResult.comebackElements.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-4 py-3">
          <Dumbbell className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-bold text-sm text-green-700 dark:text-green-300">Comeback!</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {missionResult.comebackElements.length} previously weak element{missionResult.comebackElements.length > 1 ? 's' : ''} improved
            </p>
          </div>
        </div>
      )}

      {/* Next action */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 py-3 font-bold text-sm text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-all active:scale-95"
        >
          <Map className="w-4 h-4" /> Academy
        </Link>
        <Link
          href="/quiz/setup"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-bold text-sm text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900 hover:shadow-xl transition-all active:scale-95"
        >
          <Rocket className="w-4 h-4" /> New Quiz
        </Link>
      </div>
    </div>
  );
}
