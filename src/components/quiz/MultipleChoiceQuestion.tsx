'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizOption } from '../../types/quizTypes';
import { Check, X, Lightbulb } from '@/components/icons';

interface MultipleChoiceQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  showFeedback: boolean;
  userAnswer: string | null;
}

export default function MultipleChoiceQuestion({
  question,
  onAnswer,
  disabled,
  showFeedback,
  userAnswer,
}: MultipleChoiceQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelected(null);
  }, [question.id]);

  const handleSelect = (option: QuizOption) => {
    if (disabled) return;
    setSelected(option.value);
    onAnswer(option.value);
  };

  const getOptionStyle = (option: QuizOption) => {
    if (!showFeedback) {
      if (selected === option.value) {
        return 'ring-2 ring-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-400 dark:border-cyan-500 scale-[1.02]';
      }
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-600 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 hover:scale-[1.01]';
    }

    // Show feedback
    if (option.isCorrect) {
      return 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500 quiz-correct-pulse';
    }
    if (selected === option.value && !option.isCorrect) {
      return 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500 quiz-wrong-shake';
    }
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50';
  };

  const getIconForOption = (option: QuizOption) => {
    if (!showFeedback) return null;
    if (option.isCorrect) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
          <Check className="h-4 w-4" />
        </div>
      );
    }
    if (selected === option.value && !option.isCorrect) {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shrink-0">
          <X className="h-4 w-4" />
        </div>
      );
    }
    return null;
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Question prompt */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {question.promptLabel}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
          {question.prompt}
          <span className="text-cyan-500">?</span>
        </h2>
      </div>

      {/* Options grid */}
      <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={disabled}
            className={`relative min-h-14 flex items-center gap-3 rounded-xl border-2 p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${getOptionStyle(option)} ${
              disabled && !showFeedback ? 'pointer-events-none' : ''
            }`}
            aria-label={`Option ${optionLetters[index]}: ${option.label}`}
          >
            {/* Letter badge */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shrink-0 ${
                showFeedback && option.isCorrect
                  ? 'bg-emerald-500 text-white'
                  : showFeedback && selected === option.value && !option.isCorrect
                    ? 'bg-red-500 text-white'
                    : selected === option.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {optionLetters[index]}
            </div>

            {/* Label */}
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100 flex-grow">
              {option.label}
            </span>

            {/* Feedback icon */}
            {getIconForOption(option)}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showFeedback && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 animate-[fadeIn_0.3s_ease-out]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200"><Lightbulb className="h-4 w-4" /></span>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
