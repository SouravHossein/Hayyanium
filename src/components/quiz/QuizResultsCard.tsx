'use client';

import React from 'react';
import { QuizResult } from '../../types/quizTypes';
import { Award, Clock3, Flame, RotateCcw, Sparkles, Star, ThumbsUp, Trophy, BookOpenText, FileText, Skull, XCircle } from '@/components/icons';
import { useQuizAudio } from '@/hooks/useQuizAudio';

interface Props {
  result: QuizResult;
  onStudyAgain: () => void;
  onRetry: () => void;
  onNewQuiz: () => void;
  onReview: () => void;
}

export default function QuizResultsCard({ result, onStudyAgain, onRetry, onNewQuiz, onReview }: Props) {
  const accuracyColor = result.accuracy >= 80 ? 'text-emerald-500' : result.accuracy >= 50 ? 'text-amber-500' : 'text-red-500';
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (result.accuracy / 100) * circumference;
  const { playVictory, playWrong } = useQuizAudio();
  const isBoss = result.config.missionType === 'boss';
  const isVictory = result.accuracy >= 60;

  React.useEffect(() => {
    if (isBoss) {
      if (isVictory) playVictory();
      else playWrong();
    }
  }, [isBoss, isVictory, playVictory, playWrong]);

  const formatTime = (ms: number) => {
    const s = Math.round(ms / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          {isBoss ? (
            isVictory ? <Skull className="h-12 w-12 text-red-500 fill-red-500/20 animate-bounce" /> : <XCircle className="h-12 w-12 text-gray-500" />
          ) : result.accuracy >= 80 ? (
            <Trophy className="h-10 w-10 text-amber-500" />
          ) : result.accuracy >= 50 ? (
            <ThumbsUp className="h-10 w-10 text-cyan-500" />
          ) : (
            <Flame className="h-10 w-10 text-orange-500" />
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
          {isBoss ? (isVictory ? 'BOSS DEFEATED!' : 'DEFEATED BY BOSS') : 
           result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 50 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
          {isBoss ? (isVictory ? 'You have liberated this zone!' : 'Regroup and try again, Chemist.') :
           result.accuracy >= 80 ? 'You really know your elements!' : result.accuracy >= 50 ? 'You\'re getting there!' : 'Practice makes perfect!'}
        </p>
      </div>

      {/* Score circle */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" className={accuracyColor} style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${accuracyColor}`}>{Math.round(result.accuracy)}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">accuracy</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Score', value: `${result.correctCount}/${result.totalQuestions}`, icon: Star },
          { label: 'Streak', value: String(result.bestStreak), icon: Flame },
          { label: 'Time', value: formatTime(result.totalTime), icon: Clock3 },
          { label: 'Difficulty', value: result.config.difficulty === 'hard' ? '1.5x' : result.config.difficulty === 'easy' ? '0.75x' : '1.0x', icon: Award },
          { label: 'Fastest', value: result.fastestAnswer > 0 ? formatTime(result.fastestAnswer) : 'N/A', icon: Sparkles },
        ].map(stat => (
          <div key={stat.label} className="card p-3 text-center bg-white dark:bg-gray-800">
            <stat.icon className="mx-auto h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <div className="text-lg font-black text-gray-900 dark:text-white leading-tight mt-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="flex items-center gap-4 justify-center text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-gray-700 dark:text-gray-300">{result.correctCount} correct</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-gray-700 dark:text-gray-300">{result.wrongCount} wrong</span>
        </div>
        {result.skippedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{result.skippedCount} skipped</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onReview} className="retro-btn px-4 py-3 text-sm font-black col-span-2 inline-flex items-center justify-center gap-2">
          <FileText className="h-4 w-4" /> Review Answers
        </button>
        <button onClick={onRetry} className="retro-btn bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3 text-sm font-black inline-flex items-center justify-center gap-2 text-cyan-700 dark:text-cyan-300">
          <RotateCcw className="h-4 w-4" /> Retry
        </button>
        <button onClick={onNewQuiz} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all inline-flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" /> New Quiz
        </button>
        <button onClick={onStudyAgain} className="retro-btn bg-purple-50 dark:bg-purple-900/20 px-4 py-3 text-sm font-black col-span-2 inline-flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
          <BookOpenText className="h-4 w-4" /> Study Table
        </button>
      </div>
    </div>
  );
}
