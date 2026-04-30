'use client';

import React from 'react';
import Link from 'next/link';
import { MissionDefinition, MissionType, ZoneProgress } from '@/types/progressionTypes';

const MISSION_STYLES: Record<MissionType, { label: string; icon: string; color: string; activeBg: string }> = {
  learn:    { label: 'Learn',    icon: '📖', color: 'text-blue-600 dark:text-blue-400',   activeBg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400' },
  practice: { label: 'Practice', icon: '✏️', color: 'text-green-600 dark:text-green-400', activeBg: 'bg-green-50 dark:bg-green-900/30 border-green-400' },
  speed:    { label: 'Speed',    icon: '⚡', color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-400' },
  recovery: { label: 'Recovery', icon: '💊', color: 'text-purple-600 dark:text-purple-400', activeBg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-400' },
  boss:     { label: 'BOSS',     icon: '💀', color: 'text-red-600 dark:text-red-400',     activeBg: 'bg-red-50 dark:bg-red-900/30 border-red-500' },
};

interface MissionButtonProps {
  mission: MissionDefinition;
  zoneProgress: ZoneProgress;
  playerLevel: number;
  unlockedMissionTypes: MissionType[];
  className?: string;
}

export default function MissionButton({
  mission,
  zoneProgress,
  playerLevel,
  unlockedMissionTypes,
  className = '',
}: MissionButtonProps) {
  const style = MISSION_STYLES[mission.type];
  const visited = zoneProgress.visitedMissions.includes(mission.type);
  const levelLocked = mission.unlockedAtLevel !== undefined && playerLevel < mission.unlockedAtLevel;
  const typeLocked = !unlockedMissionTypes.includes(mission.type);
  const bossLocked = mission.type === 'boss' && !zoneProgress.bossUnlocked;
  const locked = levelLocked || typeLocked || bossLocked;

  const href = locked ? undefined : `/quiz/mission/${mission.id}`;

  const inner = (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all
      ${locked
        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
        : `border-transparent hover:border-current hover:shadow-sm active:scale-95 ${style.color} ${visited ? style.activeBg + ' border-current/30' : 'bg-white dark:bg-gray-800'}`
      } ${className}`}
    >
      <span className={locked ? 'grayscale' : ''}>{locked ? '🔒' : style.icon}</span>
      <span>{style.label}</span>
      {visited && !locked && <span className="ml-auto text-xs opacity-60">✓</span>}
      {locked && bossLocked && (
        <span className="ml-auto text-[10px] opacity-60">75% coverage needed</span>
      )}
      {locked && levelLocked && (
        <span className="ml-auto text-[10px] opacity-60">Lv.{mission.unlockedAtLevel}</span>
      )}
    </div>
  );

  if (locked) return inner;
  return <Link href={href!}>{inner}</Link>;
}
