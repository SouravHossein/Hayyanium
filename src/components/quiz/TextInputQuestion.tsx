'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizQuestion } from '../../types/quizTypes';
import { allElementsData } from '../../data/elements';
import { ArrowRight, Check, Lightbulb, X } from '@/components/icons';

interface Props {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  disabled: boolean;
  showFeedback: boolean;
  userAnswer: string | null;
  hintRevealed: boolean;
  onRevealHint: () => void;
}

export default function TextInputQuestion({ question, onAnswer, onSkip, disabled, showFeedback, userAnswer, hintRevealed, onRevealHint }: Props) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pool = useMemo(() => {
    if (question.answerType === 'number') return [];
    if (question.direction.endsWith('-name')) return allElementsData.map(e => e.name);
    if (question.direction === 'name-to-symbol') return allElementsData.map(e => e.symbol);
    return [];
  }, [question.direction, question.answerType]);

  useEffect(() => { setValue(''); setSuggestions([]); inputRef.current?.focus(); }, [question.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    if (v.length >= 2 && pool.length) {
      const l = v.toLowerCase();
      const m = pool.filter(n => n.toLowerCase().startsWith(l)).slice(0, 5);
      setSuggestions(m); setShowSugg(m.length > 0);
    } else { setSuggestions([]); setShowSugg(false); }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || disabled) return;
    setShowSugg(false);
    onAnswer(value.trim());
  };

  const isCorrect = showFeedback && userAnswer !== null && question.acceptedAnswers.some(a => a.toLowerCase() === (userAnswer || '').toLowerCase());

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{question.promptLabel}</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{question.prompt}<span className="text-cyan-500">?</span></h2>
      </div>

      {hintRevealed && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-3 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300 inline-flex items-center gap-2 justify-center"><Lightbulb className="h-4 w-4" /><span className="font-bold">Hint:</span> {question.hint}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input ref={inputRef} type="text" inputMode={question.answerType === 'number' ? 'numeric' : 'text'} value={showFeedback ? (userAnswer || '') : value} onChange={handleChange} disabled={disabled} placeholder={question.answerType === 'number' ? 'Type a number...' : 'Type your answer...'} autoComplete="off"
            className={`w-full rounded-xl border-2 px-5 py-4 text-lg font-semibold text-center outline-none transition-all duration-300 ${showFeedback ? (isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300') : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'}`} aria-label="Your answer" />
          {showSugg && !disabled && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
              {suggestions.map(s => (
                <button key={s} type="button" onClick={() => { setValue(s); setShowSugg(false); onAnswer(s); }} className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700">{s}</button>
              ))}
            </div>
          )}
        </div>
        {!showFeedback && (
          <div className="flex items-center gap-3">
            <button type="submit" disabled={!value.trim() || disabled} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none">Submit Answer</button>
            {!hintRevealed && <button type="button" onClick={onRevealHint} className="rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 inline-flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Hint</button>}
            <button type="button" onClick={onSkip} className="rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 inline-flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Skip</button>
          </div>
        )}
      </form>

      {showFeedback && (
        <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
          {!isCorrect && <div className="text-center"><p className="text-sm text-gray-500 dark:text-gray-400">The correct answer is:</p><p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{question.correctAnswer}</p></div>}
          <div className={`flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
            {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}<span>{isCorrect ? 'Correct!' : 'Not quite!'}</span>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 inline-flex gap-2"><Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" /><span>{question.explanation}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
