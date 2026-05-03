'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import { getQuizSettings } from '@/lib/quiz/quizSettings';
import { QuizSettings } from '@/types/quizTypes';
import QuizProgressBar from '@/components/quiz/QuizProgressBar';
import MultipleChoiceQuestion from '@/components/quiz/MultipleChoiceQuestion';
import TextInputQuestion from '@/components/quiz/TextInputQuestion';
import FindOnTableQuestion from '@/components/quiz/FindOnTableQuestion';
import { ArrowRight, Atom, Flag, Skull, Heart } from '@/components/icons';
import { useQuizAudio } from '@/hooks/useQuizAudio';
import BossBattleHeader from '@/components/quiz/BossBattleHeader';

export default function QuizPlayPage() {
  const router = useRouter();
  const { quizState, currentQuestion, submitAnswer, skipQuestion, nextQuestion, revealHint, finishQuiz } = useQuiz();
  const [appSettings, setAppSettings] = useState<QuizSettings | null>(null);
  const { playCorrect, playWrong, playBossHit, playPlayerHit, playVictory } = useQuizAudio();

  const [isBossMode, setIsBossMode] = useState(false);
  const [bossName, setBossName] = useState('Unknown Entity');
  const [playerLives, setPlayerLives] = useState(3);

  useEffect(() => {
    setAppSettings(getQuizSettings());

    // Check if this is a boss mission
    try {
      const raw = sessionStorage.getItem('hayyanium_active_mission');
      if (raw) {
        const ctx = JSON.parse(raw);
        if (ctx.missionType === 'boss') {
          setIsBossMode(true);
          setBossName(ctx.zoneId.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' Boss');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Body theme effect for boss mode
  useEffect(() => {
    if (isBossMode) {
      document.body.classList.add('boss-battle-active');
      return () => document.body.classList.remove('boss-battle-active');
    }
  }, [isBossMode]);

  // Redirect if no active quiz
  useEffect(() => {
    if (quizState.state === 'idle' && quizState.questions.length === 0) {
      router.replace('/quiz/setup');
    }
  }, [quizState.state, quizState.questions.length, router]);

  // Auto-navigate to results on completion
  useEffect(() => {
    if (quizState.state === 'completed' && quizState.result) {
      router.push('/quiz/results');
    }
  }, [quizState.state, quizState.result, router]);

  // Handle finish when quiz completes via NEXT_QUESTION
  useEffect(() => {
    if (quizState.state === 'completed' && !quizState.result) {
      finishQuiz();
    }
  }, [quizState.state, quizState.result, finishQuiz]);

  const isFeedback = quizState.state === 'feedback';
  const lastAnswer = quizState.answers.length > 0 ? quizState.answers[quizState.answers.length - 1] : null;

  // Feedback effects (Sound and Vibration)
  useEffect(() => {
    if (isFeedback && lastAnswer && appSettings) {
      if (appSettings.vibrationEnabled && 'vibrate' in navigator) {
        if (lastAnswer.isCorrect) {
          navigator.vibrate(50);
        } else {
          navigator.vibrate([50, 100, 50]);
        }
      }
      if (appSettings.soundEnabled) {
        if (lastAnswer.isCorrect) {
          if (isBossMode) playBossHit();
          else playCorrect();
        } else {
          if (isBossMode) {
            playPlayerHit();
            setPlayerLives(prev => {
              const next = prev - 1;
              if (next <= 0) {
                // Fail logic
                setTimeout(() => finishQuiz(), 500);
              }
              return next;
            });
          } else {
            playWrong();
          }
        }
      }
    }
  }, [isFeedback, lastAnswer, appSettings, isBossMode, playBossHit, playPlayerHit, playCorrect, playWrong, finishQuiz]);

  if (!currentQuestion || !quizState.config) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Atom className="mx-auto h-10 w-10 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const userAnswerStr = isFeedback && lastAnswer ? lastAnswer.userAnswer : null;

  const handleNext = () => {
    if (quizState.currentIndex >= quizState.questions.length - 1) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };

  const fontClass = appSettings?.fontSize === 'large' ? 'text-lg' : appSettings?.fontSize === 'small' ? 'text-sm' : 'text-base';
  const motionClass = appSettings?.reducedMotion ? '[&_*]:!transition-none [&_*]:!animate-none [&_*]:!duration-0' : '';

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isBossMode ? 'bg-[#1a0b0b] boss-battle-active' : ''}`}>
      <div className={`max-w-2xl mx-auto space-y-4 sm:space-y-6 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4 sm:pt-8 ${fontClass} ${motionClass}`}>
        {/* Progress / Boss Header */}
        {isBossMode ? (
          <BossBattleHeader
            current={quizState.currentIndex}
            total={quizState.questions.length}
            bossHp={Math.max(0, 100 - (quizState.score / quizState.questions.length * 100))}
            playerHp={(playerLives / 3) * 100}
            playerLives={playerLives}
            timeRemaining={quizState.timeRemaining}
            timerEnabled={quizState.config.timerEnabled}
            bossName={bossName}
          />
        ) : (
          <QuizProgressBar
            current={quizState.currentIndex}
            total={quizState.questions.length}
            score={quizState.score}
            streak={quizState.streak}
            timeRemaining={quizState.timeRemaining}
            timerEnabled={quizState.config.timerEnabled}
          />
        )}

        {/* Question content */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-8 shadow-sm">
          {currentQuestion.format === 'multiple-choice' && (
            <MultipleChoiceQuestion
              question={currentQuestion}
              onAnswer={submitAnswer}
              disabled={isFeedback}
              showFeedback={isFeedback}
              userAnswer={userAnswerStr}
            />
          )}

          {currentQuestion.format === 'text-input' && (
            <TextInputQuestion
              question={currentQuestion}
              onAnswer={submitAnswer}
              onSkip={skipQuestion}
              disabled={isFeedback}
              showFeedback={isFeedback}
              userAnswer={userAnswerStr}
              hintRevealed={quizState.hintRevealed}
              onRevealHint={revealHint}
            />
          )}

          {currentQuestion.format === 'find-on-table' && (
            <FindOnTableQuestion
              question={currentQuestion}
              onAnswer={submitAnswer}
              disabled={isFeedback}
              showFeedback={isFeedback}
              userAnswer={userAnswerStr}
              hintRevealed={quizState.hintRevealed}
              onRevealHint={revealHint}
            />
          )}
        </div>

        {/* Next / Skip buttons */}
        <div className="flex gap-3 items-stretch">
          {isFeedback && (
            <button
              onClick={handleNext}
              className="flex-1 min-h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {quizState.currentIndex >= quizState.questions.length - 1 ? <Flag className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {quizState.currentIndex >= quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </span>
            </button>
          )}

          {!isFeedback && currentQuestion.format === 'multiple-choice' && (
            <button
              onClick={skipQuestion}
              className="ml-auto min-h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <span className="inline-flex items-center gap-2">Skip <ArrowRight className="h-4 w-4" /></span>
            </button>
          )}
        </div>

        {/* Quit quiz */}
        <div className="text-center">
          <button
            onClick={() => { finishQuiz(); }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            End quiz early
          </button>
        </div>
      </div>
    </div>
  );
}