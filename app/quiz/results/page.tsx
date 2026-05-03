'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import QuizResultsCard from '@/components/quiz/QuizResultsCard';
import XpRewardPanel from '@/components/quiz/XpRewardPanel';
import Link from 'next/link';
import { Check, Clock3, X } from '@/components/icons';
import { applyMissionResult } from '@/lib/quiz/progressionStorage';
import { allElementsData } from '@/data/elements';
import type { MissionResult, RewardUnlock, XpEvent } from '@/types/progressionTypes';

interface StoredMissionContext {
  missionId: string;
  zoneId: string;
  missionType: string;
  xpReward: number;
  difficulty?: 'easy' | 'normal' | 'hard';
}

export default function QuizResultsPage() {
  const router = useRouter();
  const { quizState, resetQuiz, startQuiz } = useQuiz();
  const [showReview, setShowReview] = useState(false);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);
  const [rewards, setRewards] = useState<RewardUnlock[]>([]);
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);
  const [xpBefore, setXpBefore] = useState(0);
  const progressionApplied = useRef(false);

  const result = quizState.result;

  useEffect(() => {
    if (!result || progressionApplied.current) return;

    // Read active mission context from sessionStorage
    try {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('hayyanium_active_mission') : null;
      if (!raw) return;

      const ctx: StoredMissionContext = JSON.parse(raw);
      progressionApplied.current = true;

      // Retrieve XP before applying
      const { getPlayerProgress } = require('@/lib/quiz/progressionStorage');
      const pBefore = getPlayerProgress();
      setXpBefore(pBefore.playerXp);

      const { missionResult: mr, rewards: rw } = applyMissionResult(
        {
          correctCount: result.correctCount,
          totalQuestions: result.totalQuestions,
          accuracy: result.accuracy,
          bestStreak: result.bestStreak,
          weakElements: result.weakElements,
          answers: result.answers,
        },
        ctx.missionId,
        ctx.zoneId,
        ctx.missionType as any,
        ctx.xpReward,
        ctx.difficulty,
      );

      setMissionResult(mr);
      setRewards(rw);

      // Build xp events for display (matching progressionEngine logic)
      const evts: XpEvent[] = [];
      const baseXp = result.correctCount * 10;
      evts.push({ source: 'correct-answer', amount: baseXp, label: `${result.correctCount} correct answers` });

      if (result.bestStreak >= 3) {
        evts.push({ source: 'streak-bonus', amount: result.bestStreak * 5, label: `${result.bestStreak}× streak bonus` });
      }

      if (mr.comebackElements.length > 0) {
        evts.push({ source: 'comeback', amount: mr.comebackElements.length * 15, label: `${mr.comebackElements.length} elements recovered` });
      }

      // Add difficulty bonus event
      const rawTotal = baseXp + (result.bestStreak >= 3 ? result.bestStreak * 5 : 0) + (mr.comebackElements.length * 15);
      const diff = ctx.difficulty ?? 'easy';
      const mult = diff === 'hard' ? 1.5 : diff === 'normal' ? 1.0 : 0.75;
      if (mult !== 1.0) {
        evts.push({
          source: 'mission-complete' as any,
          amount: Math.round(rawTotal * (mult - 1)),
          label: `${diff} mode bonus`
        });
      }

      setXpEvents(evts);

      sessionStorage.removeItem('hayyanium_active_mission');
    } catch { /* non-mission quiz — no progression */ }
  }, [result]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-500 dark:text-gray-400">No quiz results to show.</p>
          <Link href="/quiz" className="inline-block rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white">
            Go to Academy
          </Link>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    if (quizState.config) {
      startQuiz(quizState.config, allElementsData);
      router.push('/quiz/play');
    }
  };

  const handleNewQuiz = () => {
    resetQuiz();
    router.push('/quiz/setup');
  };

  const handleStudy = () => {
    resetQuiz();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Core results card */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        <QuizResultsCard
          result={result}
          onStudyAgain={handleStudy}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
          onReview={() => setShowReview(!showReview)}
        />
      </div>

      {/* XP reward panel (Commented out for refinement) */}
      {/* 
      {missionResult && (
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⭐</span> Rewards
          </h2>
          <XpRewardPanel
            missionResult={missionResult}
            rewards={rewards}
            xpEvents={xpEvents}
            totalXpBefore={xpBefore}
          />
        </div>
      )}
      */}

      {/* Weak elements revenge CTA (Commented out for refinement) */}
      {/* 
      {result.weakElements.length >= 3 && (
        <div className="rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-5 flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">💊</span>
          <div className="flex-1">
            <p className="font-bold text-purple-800 dark:text-purple-200">Revenge Run Available</p>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-0.5">
              {result.weakElements.length} elements need work. Launch a recovery mission to bounce back!
            </p>
            <Link
              href="/quiz/setup?scope=weak"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors active:scale-95"
            >
              💊 Practice Weak Elements
            </Link>
          </div>
        </div>
      )}
      */}

      {/* Academy return */}
      {/* <div className="text-center">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        >
          🗺️ Back to Quiz Academy
        </Link>
      </div> */}

      {/* Answer review */}
      {showReview && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Answer Review</h3>
          {result.answers.map((answer, i) => {
            const question = quizState.questions[i];
            if (!question) return null;
            return (
              <div
                key={answer.questionId}
                className={`rounded-xl border-2 p-4 ${answer.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : answer.skipped
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                      : 'border-red-200 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/10'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {answer.isCorrect ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : answer.skipped ? (
                        <Clock3 className="h-4 w-4 text-gray-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{question.promptLabel}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{question.prompt}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Correct:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{question.correctAnswer}</span>
                      {!answer.isCorrect && !answer.skipped && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 dark:text-gray-400">Your answer:</span>
                          <span className="font-bold text-red-600 dark:text-red-400">{answer.userAnswer}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {Math.round(answer.timeSpent / 1000)}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
