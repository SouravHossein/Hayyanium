import React, { useEffect, useMemo, useState } from 'react';
import { ElementCategory, ElementData, ProgressState, QuizMode, QuizResult } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import QuizRunner from './QuizRunner';
import Flashcards from './Flashcards';
import ProgressDashboard from './ProgressDashboard';

interface LearningHubProps {
  elements: ElementData[];
}

const CATEGORY_LIST: ElementCategory[] = [
  'alkali metal',
  'alkaline earth metal',
  'lanthanide',
  'actinide',
  'transition metal',
  'post-transition metal',
  'metalloid',
  'nonmetal',
  'halogen',
  'noble gas',
  'unknown',
];

const buildEmptyProgress = (): ProgressState => ({
  perMode: {
    symbol: { correct: 0, total: 0 },
    name: { correct: 0, total: 0 },
    atomicNumber: { correct: 0, total: 0 },
    group: { correct: 0, total: 0 },
    period: { correct: 0, total: 0 },
  },
  perCategory: CATEGORY_LIST.reduce((acc, category) => {
    acc[category] = { correct: 0, total: 0 };
    return acc;
  }, {} as Record<ElementCategory, { correct: number; total: number }>),
  perGroup: Array.from({ length: 18 }, (_, i) => String(i + 1)).reduce((acc, group) => {
    acc[group] = { correct: 0, total: 0 };
    return acc;
  }, {} as Record<string, { correct: number; total: number }>),
  perPeriod: Array.from({ length: 7 }, (_, i) => String(i + 1)).reduce((acc, period) => {
    acc[period] = { correct: 0, total: 0 };
    return acc;
  }, {} as Record<string, { correct: number; total: number }>),
  streak: 0,
  lastPlayed: null,
});

const LearningHub: React.FC<LearningHubProps> = ({ elements }) => {
  const [tab, setTab] = useState<'quiz' | 'flashcards' | 'progress'>('quiz');
  const [mode, setMode] = useState<QuizMode>('symbol');
  const [timed, setTimed] = useState(false);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>('quizResults', []);
  const [progress, setProgress] = useLocalStorage<ProgressState>('quizProgress', buildEmptyProgress());

  useEffect(() => {
    setProgress(prev => {
      const base = buildEmptyProgress();
      return {
        ...base,
        ...prev,
        perMode: { ...base.perMode, ...prev.perMode },
        perCategory: { ...base.perCategory, ...prev.perCategory },
        perGroup: { ...base.perGroup, ...prev.perGroup },
        perPeriod: { ...base.perPeriod, ...prev.perPeriod },
      };
    });
  }, [setProgress]);

  const handleComplete = (result: QuizResult, breakdown: { category: ElementCategory; group: number; period: number; correct: boolean }[]) => {
    setQuizResults(prev => [result, ...prev].slice(0, 20));
    setProgress(prev => {
      const next = { ...prev };
      next.perMode = { ...prev.perMode };
      next.perMode[result.mode] = {
        correct: prev.perMode[result.mode].correct + result.correct,
        total: prev.perMode[result.mode].total + result.total,
      };
      next.perCategory = { ...prev.perCategory };
      next.perGroup = { ...prev.perGroup };
      next.perPeriod = { ...prev.perPeriod };
      breakdown.forEach(item => {
        const stats = next.perCategory[item.category];
        next.perCategory[item.category] = {
          correct: stats.correct + (item.correct ? 1 : 0),
          total: stats.total + 1,
        };
        const groupKey = String(item.group);
        const periodKey = String(item.period);
        next.perGroup[groupKey] = {
          correct: (next.perGroup[groupKey]?.correct ?? 0) + (item.correct ? 1 : 0),
          total: (next.perGroup[groupKey]?.total ?? 0) + 1,
        };
        next.perPeriod[periodKey] = {
          correct: (next.perPeriod[periodKey]?.correct ?? 0) + (item.correct ? 1 : 0),
          total: (next.perPeriod[periodKey]?.total ?? 0) + 1,
        };
      });
      next.streak = result.correct === result.total ? prev.streak + 1 : 0;
      next.lastPlayed = Date.now();
      return next;
    });
    setTab('progress');
  };

  const lastResult = useMemo(() => quizResults[0], [quizResults]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('quiz')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'quiz' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Quiz</button>
        <button onClick={() => setTab('flashcards')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'flashcards' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Flashcards</button>
        <button onClick={() => setTab('progress')} className={`px-4 py-2 rounded-md font-semibold ${tab === 'progress' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Progress</button>
      </div>

      {tab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={mode} onChange={e => setMode(e.target.value as QuizMode)} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
              <option value="symbol">Symbol → Name</option>
              <option value="name">Name → Symbol</option>
              <option value="atomicNumber">Atomic Number → Element</option>
              <option value="group">Group Recognition</option>
              <option value="period">Period Recognition</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={timed} onChange={() => setTimed(prev => !prev)} />
              Timed (60s)
            </label>
            {lastResult && (
              <span className="text-xs text-gray-500 dark:text-gray-400">Last score: {lastResult.correct}/{lastResult.total}</span>
            )}
          </div>
          <QuizRunner elements={elements} mode={mode} timed={timed} onComplete={handleComplete} />
        </div>
      )}

      {tab === 'flashcards' && <Flashcards elements={elements} />}

      {tab === 'progress' && <ProgressDashboard progress={progress} />}
    </div>
  );
};

export default LearningHub;
