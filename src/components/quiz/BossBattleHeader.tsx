'use client';

import React from 'react';
import { Clock3, Skull, Heart } from '@/components/icons';

interface BossBattleHeaderProps {
  current: number;
  total: number;
  bossHp: number;
  playerHp: number;
  playerLives: number;
  timeRemaining: number;
  timerEnabled: boolean;
  bossName: string;
}

export default function BossBattleHeader({
  current,
  total,
  bossHp,
  playerHp,
  playerLives,
  timeRemaining,
  timerEnabled,
  bossName,
}: BossBattleHeaderProps) {
  const isLowTime = timerEnabled && timeRemaining <= 5;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-top duration-700">
      {/* Boss Stats */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-black text-xs uppercase tracking-widest text-red-500">{bossName}</span>
          </div>
          <div className="relative h-4 w-full bg-red-950 rounded-lg border-2 border-red-900 overflow-hidden shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out relative"
              style={{ width: `${bossHp}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]" />
            </div>
          </div>
        </div>

        {/* Timer */}
        {timerEnabled && (
          <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-xl border-2 font-mono font-black ${
            isLowTime ? 'bg-red-500 border-red-400 text-white animate-bounce' : 'bg-gray-900 border-gray-700 text-red-500'
          }`}>
            <span className="text-xs leading-none">SEC</span>
            <span className="text-lg leading-none">{timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Player Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i} 
              className={`w-5 h-5 transition-all duration-300 ${
                i < playerLives ? 'text-emerald-500 fill-emerald-500' : 'text-gray-700 grayscale opacity-20 scale-90'
              }`} 
            />
          ))}
        </div>

        <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800">
          CHAMBER {current + 1} <span className="opacity-40">/ {total}</span>
        </div>
      </div>
    </div>
  );
}
