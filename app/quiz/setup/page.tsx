'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import { allElementsData } from '@/data/elements';
import { QuizConfig, QuizFormat, QuizDirection, QuizDifficulty } from '@/types/quizTypes';
import { DEFAULT_QUIZ_CONFIG } from '@/lib/quiz/quizEngine';
import { getQuizSettings } from '@/lib/quiz/quizSettings';
import { getWeakElements } from '@/lib/quiz/quizStorage';
import { useFavorites } from '@/hooks/useFavorites';

const FORMATS: { value: QuizFormat; label: string; icon: string; desc: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice', icon: '🔘', desc: 'Pick the correct answer from options' },
  { value: 'text-input', label: 'Type Answer', icon: '✍️', desc: 'Type the answer with autocomplete' },
  { value: 'find-on-table', label: 'Find on Table', icon: '🗺️', desc: 'Tap the correct element on the table' },
];

const DIRECTIONS: { value: QuizDirection; label: string }[] = [
  { value: 'name-to-symbol', label: 'Name → Symbol' },
  { value: 'name-to-number', label: 'Name → Atomic Number' },
  { value: 'name-to-weight', label: 'Name → Atomic Weight' },
  { value: 'number-to-name', label: 'Atomic Number → Name' },
  { value: 'symbol-to-name', label: 'Symbol → Name' },
  { value: 'weight-to-name', label: 'Atomic Weight → Name' },
];

const QUESTION_COUNTS = [5, 10, 15, 20, 30, 50];

const CATEGORIES = ['alkali metal', 'alkaline earth metal', 'transition metal', 'post-transition metal', 'metalloid', 'nonmetal', 'halogen', 'noble gas', 'lanthanide', 'actinide'];

export default function QuizSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startQuiz } = useQuiz();
  const [favorites] = useFavorites();

  const settings = typeof window !== 'undefined' ? getQuizSettings() : null;

  const [config, setConfig] = useState<QuizConfig>(() => {
    const c = { ...DEFAULT_QUIZ_CONFIG };
    // Apply URL params
    const f = searchParams.get('format');
    if (f && ['multiple-choice', 'text-input', 'find-on-table'].includes(f)) c.format = f as QuizFormat;
    const d = searchParams.get('direction');
    if (d) c.direction = d as QuizDirection;
    const scope = searchParams.get('scope');
    const scopeValue = searchParams.get('scopeValue');
    if (scope === 'block' && scopeValue) c.scope = { type: 'block', value: scopeValue };
    // Apply user settings defaults
    if (settings) {
      c.soundEnabled = settings.soundEnabled;
      c.timerEnabled = settings.timerEnabled;
      c.timerSeconds = settings.defaultTimerSeconds;
      c.questionCount = settings.defaultQuestionCount;
      c.optionCount = settings.defaultOptionCount;
      c.strictMode = settings.strictAnswerChecking;
    }
    return c;
  });

  const updateConfig = (patch: Partial<QuizConfig>) => setConfig(prev => ({ ...prev, ...patch }));

  const handleStart = () => {
    // Resolve scope values for favorites/weak
    let resolvedConfig = { ...config };
    if (config.scope.type === 'favorites') {
      resolvedConfig.scope = { type: 'favorites', value: favorites };
    } else if (config.scope.type === 'weak') {
      resolvedConfig.scope = { type: 'weak', value: getWeakElements() };
    }
    startQuiz(resolvedConfig, allElementsData);
    router.push('/quiz/play');
  };

  const scopeCount = (() => {
    switch (config.scope.type) {
      case 'all': return 118;
      case 'period': return allElementsData.filter(e => e.period === config.scope.value).length;
      case 'group': return allElementsData.filter(e => e.group === config.scope.value).length;
      case 'block': return allElementsData.filter(e => e.block === config.scope.value).length;
      case 'category': return allElementsData.filter(e => e.category === config.scope.value).length;
      case 'favorites': return favorites.length;
      case 'weak': return getWeakElements().length;
      default: return 118;
    }
  })();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Quiz Setup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your quiz and start learning</p>
      </div>

      {/* Format */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quiz Format</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {FORMATS.map(f => (
            <button key={f.value} onClick={() => updateConfig({ format: f.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${config.format === f.value ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 ring-1 ring-cyan-500/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-cyan-300 dark:hover:border-cyan-600'}`}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{f.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Direction */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Question Direction</h2>
        <div className="grid grid-cols-2 gap-2">
          {DIRECTIONS.map(d => (
            <button key={d.value} onClick={() => updateConfig({ direction: d.value })}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${config.direction === d.value ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-600'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* Question count */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Questions ({config.questionCount})</h2>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map(n => (
            <button key={n} onClick={() => updateConfig({ questionCount: n })}
              className={`rounded-lg border px-4 py-2 text-sm font-bold transition-all ${config.questionCount === n ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'}`}>
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Element Scope <span className="text-gray-400 font-normal">({scopeCount} elements)</span></h2>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(['all', 'favorites', 'weak'] as const).map(t => (
              <button key={t} onClick={() => updateConfig({ scope: { type: t } })}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-all ${config.scope.type === t ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'}`}>
                {t === 'all' ? 'All 118' : t === 'favorites' ? `★ Favorites (${favorites.length})` : `⚠ Weak (${typeof window !== 'undefined' ? getWeakElements().length : 0})`}
              </button>
            ))}
          </div>
          {/* By period */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Period:</span>
            {[1,2,3,4,5,6,7].map(p => (
              <button key={p} onClick={() => updateConfig({ scope: { type: 'period', value: p } })}
                className={`rounded px-2.5 py-1 text-xs font-bold transition-all ${config.scope.type === 'period' && config.scope.value === p ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'}`}>
                {p}
              </button>
            ))}
          </div>
          {/* By block */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Block:</span>
            {['s','p','d','f'].map(b => (
              <button key={b} onClick={() => updateConfig({ scope: { type: 'block', value: b } })}
                className={`rounded px-2.5 py-1 text-xs font-bold transition-all ${config.scope.type === 'block' && config.scope.value === b ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'}`}>
                {b}
              </button>
            ))}
          </div>
          {/* By category */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Category:</span>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => updateConfig({ scope: { type: 'category', value: c } })}
                className={`rounded px-2 py-1 text-[10px] sm:text-xs font-semibold capitalize transition-all ${config.scope.type === 'category' && config.scope.value === c ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Difficulty */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Difficulty</h2>
        <div className="flex gap-2">
          {(['easy','normal','hard'] as QuizDifficulty[]).map(d => (
            <button key={d} onClick={() => updateConfig({ difficulty: d })}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-bold capitalize transition-all ${config.difficulty === d ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'}`}>
              {d === 'easy' ? '😊 Easy' : d === 'normal' ? '🧠 Normal' : '🔥 Hard'}
            </button>
          ))}
        </div>
      </section>

      {/* Timer + Options */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Options</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Timer toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div><div className="text-sm font-bold text-gray-800 dark:text-gray-200">⏱️ Timer</div><div className="text-xs text-gray-500 dark:text-gray-400">Time limit per question</div></div>
            <button onClick={() => updateConfig({ timerEnabled: !config.timerEnabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${config.timerEnabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${config.timerEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {config.timerEnabled && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Seconds:</span>
              <input type="range" min={5} max={120} step={5} value={config.timerSeconds} onChange={e => updateConfig({ timerSeconds: Number(e.target.value) })} className="flex-1 accent-cyan-500" />
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 w-8 text-right">{config.timerSeconds}</span>
            </div>
          )}
          {/* Shuffle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div><div className="text-sm font-bold text-gray-800 dark:text-gray-200">🔀 Shuffle</div><div className="text-xs text-gray-500 dark:text-gray-400">Randomize questions</div></div>
            <button onClick={() => updateConfig({ shuffleQuestions: !config.shuffleQuestions })}
              className={`relative h-6 w-11 rounded-full transition-colors ${config.shuffleQuestions ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${config.shuffleQuestions ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Start button */}
      <div className="pt-4 pb-8">
        <button onClick={handleStart} disabled={scopeCount < 2}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100">
          🚀 Start Quiz ({Math.min(config.questionCount, scopeCount)} questions)
        </button>
        {scopeCount < 2 && <p className="text-center text-xs text-red-500 mt-2">Need at least 2 elements in scope</p>}
      </div>
    </div>
  );
}
