'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getQuizHistory } from '@/lib/quiz/quizStorage';
import { QuizResult } from '@/types/quizTypes';
import ElementMasteryGrid from '@/components/quiz/ElementMasteryGrid';

export default function QuizHistoryPage() {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [filterFormat, setFilterFormat] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getQuizHistory());
  }, []);

  const filtered = useMemo(() => {
    let r = history;
    if (filterFormat) r = r.filter(x => x.config.format === filterFormat);
    if (filterDifficulty) r = r.filter(x => x.config.difficulty === filterDifficulty);
    return r;
  }, [history, filterFormat, filterDifficulty]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Quiz History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your progress and review past quizzes</p>
      </div>

      {/* Mastery grid */}
      <section className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Element Mastery</h2>
        <ElementMasteryGrid />
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          <option value="">All Formats</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="text-input">Text Input</option>
          <option value="find-on-table">Find on Table</option>
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
        <span className="text-sm text-gray-400 dark:text-gray-500 self-center ml-auto">{filtered.length} results</span>
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500 dark:text-gray-400 font-semibold">No quizzes yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Take your first quiz to start tracking progress!</p>
          <a href="/quiz/setup" className="inline-block mt-4 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-600 transition-colors">Start a Quiz</a>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">{r.config.format.replace(/-/g, ' ')}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${r.config.difficulty === 'easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : r.config.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {r.config.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(r.date).toLocaleDateString()} · {r.config.direction.replace(/-/g, ' ')} · {r.correctCount}/{r.totalQuestions} correct
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-extrabold ${r.accuracy >= 80 ? 'text-emerald-500' : r.accuracy >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {Math.round(r.accuracy)}%
                  </div>
                  {r.bestStreak > 0 && <div className="text-xs text-gray-400">🔥 {r.bestStreak} streak</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
