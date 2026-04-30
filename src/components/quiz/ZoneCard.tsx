'use client';

import React, { useState } from 'react';
import { ZoneDefinition, ZoneProgress, MissionType } from '@/types/progressionTypes';
import { buildMissionsForZone } from '@/data/zones';
import MissionButton from './MissionButton';
import { 
  Zap, Flame, Droplet, FlaskConical, Leaf, Moon, Radio, 
  CircleDot, Atom, BrainCircuit, Gem, 
  ChevronDown, CheckCircle2 
} from '@/components/icons';

const ZONE_ICON_MAP: Record<string, any> = {
  'period-1': Zap,
  'period-2': Flame,
  'period-3': Droplet,
  'period-4': FlaskConical,
  'period-5': Leaf,
  'period-6': Moon,
  'period-7': Radio,
  'block-s':  CircleDot,
  'block-p':  Atom,
  'block-d':  BrainCircuit,
  'block-f':  Gem,
  'cat-alkali': Zap,
  'cat-halogen': FlaskConical,
  'cat-noble': Atom,
  'cat-transition': BrainCircuit,
};

function ZoneIcon({ zoneId, cleared, className }: { zoneId: string; cleared: boolean; className?: string }) {
  const Icon = ZONE_ICON_MAP[zoneId] || Atom;
  if (cleared) return <CheckCircle2 className={`text-emerald-500 fill-emerald-500/20 ${className}`} />;
  return <Icon className={className} />;
}

interface ZoneCardProps {
  zone: ZoneDefinition;
  zoneProgress: ZoneProgress;
  playerLevel: number;
  unlockedMissionTypes: MissionType[];
  isActive?: boolean;
}

export default function ZoneCard({
  zone,
  zoneProgress,
  playerLevel,
  unlockedMissionTypes,
  isActive = false,
}: ZoneCardProps) {
  const [expanded, setExpanded] = useState(isActive);
  const missions = buildMissionsForZone(zone);

  const coveragePct = zone.totalElements > 0
    ? Math.round((zoneProgress.coverageCount / zone.totalElements) * 100)
    : 0;
  const masteryPct = zoneProgress.masteryScore;
  const cleared = zoneProgress.bossCleared && zoneProgress.visitedMissions.includes('learn');

  const circumference = 2 * Math.PI * 18; // r=18
  const stroke = circumference - (coveragePct / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border-2 transition-all overflow-hidden
        ${cleared
          ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-900/20'
          : isActive
            ? 'border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80'
        }`}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        {/* Progress ring */}
        <div className="relative flex-shrink-0 w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4"
              className="text-gray-200 dark:text-gray-700" />
            <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4"
              className="text-amber-400 dark:text-amber-500"
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={stroke}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <ZoneIcon zoneId={zone.id} cleared={cleared} className="w-6 h-6" />
          </span>
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 dark:text-white text-sm">{zone.label}</span>
            {isActive && !cleared && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">ACTIVE</span>
            )}
            {cleared && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">CLEARED</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{coveragePct}% coverage</span>
            <span className="text-xs text-gray-400 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{masteryPct}% mastery</span>
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Mission list */}
      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          {missions.map(mission => (
            <MissionButton
              key={mission.id}
              mission={mission}
              zoneProgress={zoneProgress}
              playerLevel={playerLevel}
              unlockedMissionTypes={unlockedMissionTypes}
            />
          ))}
          {/* Mastery bar */}
          <div className="col-span-full mt-1">
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
              <span>Zone mastery</span>
              <span>{masteryPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
