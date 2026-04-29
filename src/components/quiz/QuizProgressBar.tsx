'use client';

import React from 'react';
import { Clock3, Flame, Star } from '@/components/icons';

interface QuizProgressBarProps {
  current: number;
  total: number;
  score: number;
  streak: number;
  timeRemaining: number;
  timerEnabled: boolean;
}

export default function QuizProgressBar({
  current,
  total,
  score,
  streak,
  timeRemaining,
  timerEnabled,
}: QuizProgressBarProps) {
  const progress = total > 0 ? ((current) / total) * 100 : 0;
  const isLowTime = timerEnabled && timeRemaining <= 5;

  return (
    <div className="w-full space-y-3">
      {/* Top stats row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-800 dark:text-gray-200">
            Q {current + 1}
            <span className="font-normal text-gray-400 dark:text-gray-500"> / {total}</span>
          </span>

          {/* Score */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 border border-emerald-200 dark:border-emerald-700/50">
            <Star className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{score}</span>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-900/30 px-3 py-1 border border-orange-200 dark:border-orange-700/50 animate-[pulse_1.5s_ease-in-out_infinite]">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-bold text-orange-600 dark:text-orange-300">{streak}</span>
            </div>
          )}
        </div>

        {/* Timer */}
        {timerEnabled && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono font-bold text-sm transition-colors ${
              isLowTime
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/50 animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <Clock3 className="h-4 w-4" />
            <span>{timeRemaining}s</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Glow effect at the leading edge */}
        <div
          className="absolute inset-y-0 h-full w-4 rounded-full bg-white/40 blur-sm transition-all duration-500"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
    </div>
  );
}
