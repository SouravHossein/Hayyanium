'use client';

import React from 'react';
import { QuizResult } from '../../types/quizTypes';

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
  const formatTime = (ms: number) => {
    const s = Math.round(ms / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{result.accuracy >= 80 ? '🎉' : result.accuracy >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 50 ? 'Good Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {result.accuracy >= 80 ? 'You really know your elements!' : result.accuracy >= 50 ? 'You\'re getting there!' : 'Practice makes perfect!'}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Score', value: `${result.correctCount}/${result.totalQuestions}`, icon: '⭐' },
          { label: 'Best Streak', value: String(result.bestStreak), icon: '🔥' },
          { label: 'Time', value: formatTime(result.totalTime), icon: '⏱️' },
          { label: 'Fastest', value: result.fastestAnswer > 0 ? formatTime(result.fastestAnswer) : 'N/A', icon: '⚡' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="text-lg">{stat.icon}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
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
        <button onClick={onReview} className="rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all col-span-2">📋 Review Answers</button>
        <button onClick={onRetry} className="rounded-xl border-2 border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-all">🔄 Retry Same Quiz</button>
        <button onClick={onNewQuiz} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">✨ New Quiz</button>
        <button onClick={onStudyAgain} className="rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all col-span-2">📚 Study Periodic Table</button>
      </div>
    </div>
  );
}
