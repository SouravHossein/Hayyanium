'use client';

import React from 'react';
import { PlayerRank } from '@/types/progressionTypes';
import { GraduationCap, FlaskConical, Zap, Trophy, Crown } from '@/components/icons';

const RANK_STYLES: Record<PlayerRank, { bg: string; text: string; border: string; glow: string }> = {
  'Novice':          { bg: 'bg-slate-100 dark:bg-slate-800',    text: 'text-slate-600 dark:text-slate-300',  border: 'border-slate-300 dark:border-slate-600', glow: '' },
  'Apprentice':      { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300',  border: 'border-green-300 dark:border-green-600', glow: '' },
  'Lab Adept':       { bg: 'bg-blue-100 dark:bg-blue-900/40',   text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-300 dark:border-blue-600',   glow: '' },
  'Elementalist':    { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-600', glow: 'shadow-purple-200 dark:shadow-purple-900' },
  'Master Chemist':  { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-400 dark:border-amber-600', glow: 'shadow-amber-200 dark:shadow-amber-900' },
  'Grand Alchemist': { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', text: 'text-white', border: 'border-amber-400', glow: 'shadow-amber-300 dark:shadow-amber-800' },
};

const RANK_ICONS: Record<PlayerRank, any> = {
  'Novice': GraduationCap,
  'Apprentice': FlaskConical,
  'Lab Adept': FlaskConical,
  'Elementalist': Zap,
  'Master Chemist': Trophy,
  'Grand Alchemist': Crown,
};

interface RankBadgeProps {
  rank: PlayerRank;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RankBadge({ rank, size = 'md', className = '' }: RankBadgeProps) {
  const Icon = RANK_ICONS[rank];
  const style = RANK_STYLES[rank];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold shadow-sm ${style.bg} ${style.text} ${style.border} ${style.glow} ${padding} ${className}`}
    >
      <Icon className={iconSize} />
      <span>{rank}</span>
    </span>
  );
}
