'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getQuizHistory } from '@/lib/quiz/quizStorage';
import { QuizResult } from '@/types/quizTypes';
import ElementMasteryGrid from '@/components/quiz/ElementMasteryGrid';
import { ArrowLeft, ChartColumn, Flame, Star } from '@/components/icons';

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
    let results = history;
    if (filterFormat) results = results.filter((x) => x.config.format === filterFormat);
    if (filterDifficulty) results = results.filter((x) => x.config.difficulty === filterDifficulty);
    return results;
  }, [history, filterFormat, filterDifficulty]);

  const summary = useMemo(() => {
    const bestScore = history.length ? Math.max(...history.map((r) => r.accuracy)) : 0;
    const averageScore = history.length
      ? Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / history.length)
      : 0;

    return {
      total: history.length,
      bestScore,
      averageScore,
    };
  }, [history]);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <Link href="/quiz" className="inline-flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Quiz</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">Quiz History</h1>
      </header>

      <section className="card p-6 sm:p-8">
        <p className="text-sm font-bold opacity-80">
          Review past results, compare formats, and check which elements you have mastered most often.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Quizzes', value: summary.total, icon: ChartColumn },
          { label: 'Best Score', value: `${summary.bestScore}%`, icon: Star },
          { label: 'Average', value: `${summary.averageScore}%`, icon: Flame },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <item.icon className="mx-auto h-5 w-5 text-[var(--color-alkali-metal)]" />
            <div className="text-sm font-black uppercase tracking-wider opacity-80">{item.label}</div>
            <div className="mt-2 text-3xl font-black text-[var(--color-alkali-metal)]">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-black uppercase tracking-wider mb-3">Element Mastery</h2>
        <ElementMasteryGrid />
      </section>

      <section className="flex flex-wrap gap-3 items-center">
        <select
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-3 text-sm font-bold"
        >
          <option value="">All Formats</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="text-input">Text Input</option>
          <option value="find-on-table">Find on Table</option>
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-3 text-sm font-bold"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
        <span className="ml-auto text-sm font-black uppercase tracking-wider">
          {filtered.length} Results
        </span>
      </section>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <h3 className="text-lg font-black uppercase tracking-wider">No Scores Yet</h3>
          <p className="text-sm font-bold opacity-80 mt-2">Insert coin to begin.</p>
          <Link href="/quiz/setup" className="retro-btn inline-flex mt-6 px-6 py-3 text-sm font-black bg-[var(--color-alkali-metal)] text-[var(--color-retro-text)]">
            Start Game
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((result, index) => (
            <article key={result.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 shrink-0 text-center text-2xl font-black text-[var(--color-alkali-metal)]">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider">
                      {result.config.format.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                      [{result.config.difficulty}]
                    </span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">
                    {new Date(result.date).toLocaleDateString()} · {result.config.direction.replace(/-/g, ' ')} · {result.correctCount}/{result.totalQuestions}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 sm:flex-col sm:items-end">
                <div
                  className="text-4xl font-black"
                  style={{
                    color: result.accuracy >= 80 ? 'var(--color-actinide)' : result.accuracy >= 50 ? 'var(--color-alkali-metal)' : '#ef4444',
                  }}
                >
                  {Math.round(result.accuracy)}%
                </div>
                {result.bestStreak > 0 && (
                  <div className="text-xs font-black uppercase tracking-wider bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-2 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                    <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Max Combo {result.bestStreak}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
