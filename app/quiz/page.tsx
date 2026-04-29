'use client';

import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizProgress, getQuizHistory } from '@/lib/quiz/quizStorage';
import { QuizProgress, QuizResult } from '@/types/quizTypes';
import { ArrowRight, Atom, BookOpenText, ChartColumn, Flame, FlaskConical, Gamepad2, Rocket, Star, Target, TrendingUp, Zap, PencilLine, CircleDot, Map } from '@/components/icons';

const QUICK_MODES = [
  { label: 'Name → Symbol', direction: 'name-to-symbol', format: 'multiple-choice', icon: CircleDot, color: 'from-cyan-500 to-blue-500' },
  { label: 'Number → Name', direction: 'number-to-name', format: 'multiple-choice', icon: Target, color: 'from-purple-500 to-pink-500' },
  { label: 'Find on Table', direction: 'name-to-number', format: 'find-on-table', icon: Map, color: 'from-emerald-500 to-teal-500' },
  { label: 'Symbol → Name', direction: 'symbol-to-name', format: 'text-input', icon: PencilLine, color: 'from-orange-500 to-red-500' },
];

const BLOCK_SHORTCUTS = [
  { label: 's-block', value: 's', icon: CircleDot, desc: 'Groups 1-2' },
  { label: 'p-block', value: 'p', icon: Target, desc: 'Groups 13-18' },
  { label: 'd-block', value: 'd', icon: ChartColumn, desc: 'Groups 3-12' },
  { label: 'f-block', value: 'f', icon: Atom, desc: 'Lanthanides & Actinides' },
];

export default function QuizGamePage() {
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getQuizProgress());
    setRecentResults(getQuizHistory().slice(0, 3));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-8 sm:p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <Atom className="absolute top-4 right-8 h-20 w-20 opacity-20" />
          <FlaskConical className="absolute bottom-4 left-8 h-16 w-16 opacity-15" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Master the<br />Periodic Table
          </h1>
          <p className="mt-3 text-cyan-100 text-sm sm:text-base leading-relaxed">
            Test your chemistry knowledge with interactive quizzes. Learn element names, symbols, atomic numbers, and weights through practice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quiz/setup" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-xl active:scale-95">
              <span className="inline-flex items-center gap-2"><Rocket className="h-4 w-4" /> Start Quiz</span>
            </Link>
            <Link href="/" className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/25 hover:scale-105 active:scale-95">
              <span className="inline-flex items-center gap-2"><BookOpenText className="h-4 w-4" /> Study Table</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      {mounted && progress && progress.totalQuizzes > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Quizzes Taken', value: progress.totalQuizzes, icon: Gamepad2 },
            { label: 'Accuracy', value: `${Math.round(progress.overallAccuracy)}%`, icon: Target },
            { label: 'Mastered', value: `${progress.masteredCount}/118`, icon: Star },
            { label: 'Day Streak', value: progress.currentStreak, icon: Flame },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm">
              <s.icon className="mx-auto h-6 w-6 mb-1 text-cyan-600 dark:text-cyan-400" />
              <div className="text-xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </section>
      )}

      {/* Quick-start modes */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Popular Quiz Modes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_MODES.map(mode => (
            <Link
              key={mode.label}
              href={`/quiz/setup?format=${mode.format}&direction=${mode.direction}`}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            >
              <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} text-2xl shadow-sm`}>
                <mode.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{mode.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learn by block */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Learn by Block</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BLOCK_SHORTCUTS.map(block => (
            <Link
              key={block.value}
              href={`/quiz/setup?scope=block&scopeValue=${block.value}`}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            >
              <block.icon className="h-6 w-6 mb-1 text-cyan-600 dark:text-cyan-400" />
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{block.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{block.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent results */}
      {mounted && recentResults.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Scores</h2>
            <Link href="/quiz/history" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="space-y-2">
            {recentResults.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                <div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">{r.config.format.replace(/-/g, ' ')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(r.date).toLocaleDateString()} · {r.config.direction.replace(/-/g, ' ')}</div>
                </div>
                <div className={`text-lg font-extrabold ${r.accuracy >= 80 ? 'text-emerald-500' : r.accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {Math.round(r.accuracy)}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
