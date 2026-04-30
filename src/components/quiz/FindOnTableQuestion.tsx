'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types/quizTypes';
import { allElementsData } from '../../data/elements';
import { CATEGORY_HEX_COLORS } from '../../constants';
import { ElementData, ElementCategory } from '../../types';
import { Check, Lightbulb, X } from '@/components/icons';

interface Props {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  showFeedback: boolean;
  userAnswer: string | null;
  hintRevealed: boolean;
  onRevealHint: () => void;
}

export default function FindOnTableQuestion({ question, onAnswer, disabled, showFeedback, userAnswer, hintRevealed, onRevealHint }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const correctAtomicNumber = question.element.atomicNumber;

  useEffect(() => { setSelected(null); }, [question.id]);

  const handleClick = (el: ElementData) => {
    if (disabled) return;
    setSelected(el.atomicNumber);
    onAnswer(String(el.atomicNumber));
  };

  const getCellStyle = (el: ElementData) => {
    const baseColor = CATEGORY_HEX_COLORS[el.category] || '#d9d9d9';
    if (!showFeedback) {
      if (selected === el.atomicNumber) return { bg: 'ring-2 ring-cyan-500', color: baseColor };
      return { bg: '', color: baseColor };
    }
    if (el.atomicNumber === correctAtomicNumber) return { bg: 'ring-3 ring-emerald-500 quiz-correct-pulse z-10', color: '#10b981' };
    if (selected === el.atomicNumber && el.atomicNumber !== correctAtomicNumber) return { bg: 'ring-2 ring-red-500 quiz-wrong-shake', color: '#ef4444' };
    return { bg: 'opacity-30', color: baseColor };
  };

  // Build standard 18-col grid positions
  const maxRow = 10;
  const maxCol = 18;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Prompt */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{question.promptLabel}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{question.prompt}<span className="text-cyan-500">?</span></h2>
      </div>

      {/* Hint button */}
      {!showFeedback && !hintRevealed && (
        <div className="flex justify-center">
          <button onClick={onRevealHint} className="min-h-10 rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 inline-flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Hint</button>
        </div>
      )}
      {hintRevealed && (
        <div className="text-center rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-2 text-xs text-amber-700 dark:text-amber-300 inline-flex items-center justify-center gap-2"><Lightbulb className="h-4 w-4" /><span>{question.hint}</span></div>
      )}

      {/* Periodic Table Grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="inline-grid gap-[2px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`, minWidth: '640px' }}>
          {allElementsData.map((el) => {
            const style = getCellStyle(el);
            const row = el.ypos;
            const col = el.xpos;

            return (
              <button
                key={el.atomicNumber}
                onClick={() => handleClick(el)}
                disabled={disabled}
                className={`relative flex flex-col items-center justify-center rounded p-0.5 sm:p-1 text-center transition-all duration-200 cursor-pointer hover:scale-110 hover:z-10 ${style.bg} ${disabled && !showFeedback ? 'pointer-events-none' : ''}`}
                style={{
                  gridRow: row,
                  gridColumn: col,
                  backgroundColor: style.color,
                  minWidth: '32px',
                  minHeight: '32px',
                }}
                title={`${el.name} (${el.symbol})`}
                aria-label={`${el.name}, atomic number ${el.atomicNumber}`}
              >
                <span className="text-[7px] sm:text-[8px] leading-none text-gray-800/70 dark:text-white/70 font-medium">{el.atomicNumber}</span>
                <span className="text-[9px] sm:text-xs font-bold leading-none text-gray-900 dark:text-white">{el.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
          <div className={`flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm ${
            selected === correctAtomicNumber
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {selected === correctAtomicNumber ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span>{selected === correctAtomicNumber ? `Correct! That's ${question.element.name}!` : `That's not right. ${question.element.name} (${question.element.symbol}) is element #${correctAtomicNumber}.`}</span>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 inline-flex gap-2"><Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" /><span>{question.explanation}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
