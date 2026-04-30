'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PlayerRank } from '@/types/progressionTypes';
import { computeLevel } from '@/lib/quiz/progressionEngine';
import RankBadge from './RankBadge';

interface PlayerXpBarProps {
  xp: number;
  level: number;
  rank: PlayerRank;
  animate?: boolean;
  compact?: boolean;
}

export default function PlayerXpBar({ xp, level, rank, animate = true, compact = false }: PlayerXpBarProps) {
  const { xpIntoLevel, xpForNext } = computeLevel(xp);
  const pct = Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100));

  const [displayPct, setDisplayPct] = useState(animate ? 0 : pct);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) { setDisplayPct(pct); return; }
    let start: number | null = null;
    const duration = 800;
    const from = 0;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(from + (pct - from) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [pct, animate]);

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 dark:bg-amber-500 text-xs font-black text-white shadow">
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
              style={{ width: `${displayPct}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{xpIntoLevel}/{xpForNext}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Level circle */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-lg shadow-md shadow-amber-200 dark:shadow-amber-900 flex-shrink-0">
            {level}
          </div>
          <div>
            <RankBadge rank={rank} size="sm" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{xp.toLocaleString()} XP</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{xpIntoLevel} / {xpForNext} to next</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-all duration-700 relative"
          style={{ width: `${displayPct}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        </div>
        {/* Pct label */}
        {displayPct > 15 && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 mix-blend-plus-lighter">
            {displayPct}%
          </span>
        )}
      </div>
    </div>
  );
}
