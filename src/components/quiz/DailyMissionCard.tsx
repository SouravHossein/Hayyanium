'use client';

import React from 'react';
import Link from 'next/link';
import { DailyMissionSet } from '@/types/progressionTypes';
import { Rocket, RotateCcw, Zap, Flame, Shield, CheckCircle2, ChevronRight } from '@/components/icons';

const DAILY_MISSION_META = [
  { icon: Rocket,    theme: 'Easy Win',   colorClass: 'from-green-400 to-emerald-500',  border: 'border-green-300 dark:border-green-700', bg: 'bg-green-50 dark:bg-green-900/20' },
  { icon: RotateCcw, theme: 'Weak Repair', colorClass: 'from-purple-400 to-violet-500', border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: Zap,       theme: 'Challenge',   colorClass: 'from-amber-400 to-orange-500',  border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

interface DailyMissionCardProps {
  dailySet: DailyMissionSet;
  streakCount: number;
  streakFreezeCount: number;
}

export default function DailyMissionCard({ dailySet, streakCount, streakFreezeCount }: DailyMissionCardProps) {
  const completedCount = dailySet.completedIds.length;
  const allDone = completedCount >= 3;

  return (
    <div className="space-y-4">
      {/* Streak header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-black text-orange-700 dark:text-orange-300 text-lg">{streakCount}</span>
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">day streak</span>
          </div>
          {streakFreezeCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
              <Shield className="w-4 h-4 text-blue-500 fill-blue-500/20" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">×{streakFreezeCount}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/3 done
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>

      {/* Mission cards */}
      <div className="space-y-3">
        {dailySet.missions.map((mission, i) => {
          const meta = DAILY_MISSION_META[i];
          const done = dailySet.completedIds.includes(mission.id);
          const href = `/quiz/mission/${mission.id}`;

          const inner = (
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
              ${done
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 opacity-70'
                : `${meta.border} ${meta.bg} hover:shadow-md active:scale-[0.98]`
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${meta.colorClass} flex items-center justify-center text-white shadow`}>
                {done ? <CheckCircle2 className="w-6 h-6" /> : <meta.icon className="w-5 h-5" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{meta.theme}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold uppercase">{mission.type}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{mission.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{mission.questionCount} questions · +{mission.xpReward} XP</p>
              </div>

              {/* Arrow or checkmark */}
              <div className="flex-shrink-0 text-gray-400">
                {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>
          );

          return done ? <div key={mission.id}>{inner}</div> : (
            <Link key={mission.id} href={href}>{inner}</Link>
          );
        })}
      </div>

      {allDone && (
        <div className="text-center py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-200 dark:shadow-amber-900">
          🎉 All daily missions complete! Come back tomorrow.
        </div>
      )}
    </div>
  );
}
