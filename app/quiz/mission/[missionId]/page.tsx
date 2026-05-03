'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import { getMissionById, ZONE_MAP, buildMissionsForZone } from '@/data/zones';
import { allElementsData } from '@/data/elements';
import { getWeakElements } from '@/lib/quiz/quizStorage';
import type { QuizConfig, QuizScope } from '@/types/quizTypes';
import { DEFAULT_QUIZ_CONFIG } from '@/lib/quiz/quizEngine';
import type { MissionDefinition } from '@/types/progressionTypes';
import { getPlayerProgress } from '@/lib/quiz/progressionStorage';

function MissionBridgeContent() {
  const params = useParams();
  const router = useRouter();
  const { startQuiz } = useQuiz();

  const missionId = typeof params?.missionId === 'string' ? params.missionId : '';

  useEffect(() => {
    if (!missionId) { router.replace('/quiz'); return; }

    // Look up mission definition
    let mission: MissionDefinition | null = getMissionById(missionId);

    // Daily missions have date-stamped IDs — look up by base type
    if (!mission) {
      if (missionId.startsWith('daily-easy-')) {
        const zone = ZONE_MAP['period-1'];
        if (zone) mission = buildMissionsForZone(zone).find(m => m.type === 'learn') ?? null;
      } else if (missionId.startsWith('daily-weak-')) {
        const p = getPlayerProgress();
        const weekZone = ZONE_MAP[p.activeZoneId ?? 'period-1'] ?? ZONE_MAP['period-1'];
        mission = buildMissionsForZone(weekZone).find(m => m.type === 'recovery') ?? null;
      } else if (missionId.startsWith('daily-challenge-')) {
        const zone = ZONE_MAP['period-2'];
        if (zone) mission = buildMissionsForZone(zone).find(m => m.type === 'speed') ?? null;
      }
    }

    if (!mission) { router.replace('/quiz'); return; }

    const zone = ZONE_MAP[mission.zoneId];

    // Build scope from zone definition
    let scope: QuizScope = { type: 'all' };
    if (zone) {
      if (zone.scopeType === 'period')   scope = { type: 'period',   value: zone.scopeValue };
      if (zone.scopeType === 'block')    scope = { type: 'block',    value: zone.scopeValue };
      if (zone.scopeType === 'category') scope = { type: 'category', value: zone.scopeValue };
    }

    // Recovery missions: scope to weak elements in zone
    if (mission.type === 'recovery') {
      const weakEls = getWeakElements();
      if (zone && weakEls.length > 0) {
        const zoneEls = allElementsData.filter(e => {
          if (zone.scopeType === 'period')   return e.period === zone.scopeValue;
          if (zone.scopeType === 'block')    return e.block.toLowerCase() === String(zone.scopeValue).toLowerCase();
          if (zone.scopeType === 'category') return e.category.toLowerCase() === String(zone.scopeValue).toLowerCase();
          return false;
        }).map(e => e.atomicNumber);
        const zoneWeak = zoneEls.filter(n => weakEls.includes(n));
        if (zoneWeak.length > 0) scope = { type: 'weak', value: zoneWeak };
      }
    }

    const config: QuizConfig = {
      ...DEFAULT_QUIZ_CONFIG,
      questionCount: mission.questionCount,
      scope,
      timerEnabled: mission.timerEnabled,
      timerSeconds: mission.timerSeconds ?? 30,
      shuffleQuestions: true,
      shuffleOptions: true,
      difficulty: mission.type === 'boss' ? 'hard' : mission.type === 'speed' ? 'normal' : 'easy',
      optionCount: mission.type === 'boss' ? 5 : 4,
      strictMode: mission.type === 'boss',
    };

    // Store mission context in sessionStorage for results page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hayyanium_active_mission', JSON.stringify({
        missionId: mission.id,
        zoneId: mission.zoneId,
        missionType: mission.type,
        xpReward: mission.xpReward,
        difficulty: config.difficulty,
      }));
    }

    startQuiz(config, allElementsData);
    router.replace('/quiz/play');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Launching mission…</p>
    </div>
  );
}

export default function MissionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400" />
      </div>
    }>
      <MissionBridgeContent />
    </Suspense>
  );
}
