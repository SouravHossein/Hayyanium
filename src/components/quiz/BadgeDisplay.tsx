'use client';

import React from 'react';
import { BadgeId } from '@/types/progressionTypes';
import {
  FlaskConical, Flame, Target, Crown, Zap,
  Trophy, Sword, Award, Medal, Skull, Star
} from '@/components/icons';

const BADGE_META: Record<string, { icon: any; label: string; color: string }> = {
  'first-quiz': { icon: FlaskConical, label: 'First Quiz', color: 'from-blue-400 to-cyan-500' },
  'week-streak': { icon: Flame, label: 'Week Streak', color: 'from-orange-400 to-red-500' },
  'perfect-run': { icon: Target, label: 'Perfect Run', color: 'from-emerald-400 to-green-500' },
  'comeback-king': { icon: Crown, label: 'Comeback King', color: 'from-purple-400 to-pink-500' },
  'speed-demon': { icon: Zap, label: 'Speed Demon', color: 'from-yellow-400 to-amber-500' },
  'master-chemist': { icon: Trophy, label: 'Master Chemist', color: 'from-amber-400 to-orange-500' },
  'boss-slayer': { icon: Sword, label: 'Boss Slayer', color: 'from-red-500 to-rose-600' },
  'daily-devotee': { icon: Award, label: 'Daily Devotee', color: 'from-teal-400 to-cyan-500' },
};

function getBadgeMeta(badgeId: string) {
  if (BADGE_META[badgeId]) return BADGE_META[badgeId];
  if (badgeId.startsWith('zone-cleared-')) {
    const zone = badgeId.replace('zone-cleared-', '').replace(/-/g, ' ');
    return { icon: Medal, label: `${zone} cleared`, color: 'from-indigo-400 to-violet-500' };
  }
  if (badgeId.startsWith('boss-cleared-')) {
    const zone = badgeId.replace('boss-cleared-', '').replace(/-/g, ' ');
    return { icon: Skull, label: `${zone} boss`, color: 'from-rose-500 to-red-600' };
  }
  return { icon: Star, label: badgeId, color: 'from-gray-400 to-slate-500' };
}

interface BadgeDisplayProps {
  badges: BadgeId[];
  size?: 'sm' | 'md';
  className?: string;
}

export default function BadgeDisplay({ badges, size = 'md', className = '' }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-400 dark:text-gray-500 ${className}`}>
        <div className="flex justify-center mb-2">
          <Medal className="w-10 h-10" />
        </div>
        <p className="text-sm">No badges yet — complete missions to earn them!</p>
      </div>
    );
  }

  const cellSize = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const emojiSize = size === 'sm' ? 'text-xl' : 'text-2xl';
  const labelSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {badges.map(badgeId => {
        const meta = getBadgeMeta(badgeId);
        return (
          <div
            key={badgeId}
            title={meta.label}
            className={`flex flex-col items-center gap-1 group cursor-default`}
          >
            <div className={`${cellSize} rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 text-white`}>
              <meta.icon className={size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} />
            </div>
            <span className={`${labelSize} font-semibold text-center text-gray-600 dark:text-gray-400 max-w-[64px] leading-tight`}>
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
