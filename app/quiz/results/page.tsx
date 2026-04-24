'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import QuizResultsCard from '@/components/quiz/QuizResultsCard';

export default function QuizResultsPage() {
  const router = useRouter();
  const { quizState, resetQuiz, startQuiz } = useQuiz();
  const [showReview, setShowReview] = useState(false);

  const result = quizState.result;

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-500 dark:text-gray-400">No quiz results to show.</p>
          <a href="/quiz/setup" className="inline-block rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white">Start a Quiz</a>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    if (quizState.config) {
      const { default: allElements } = require('@/data/elements');
      startQuiz(quizState.config, allElements.allElementsData || []);
      router.push('/quiz/play');
    }
  };

  const handleNewQuiz = () => {
    resetQuiz();
    router.push('/quiz/setup');
  };

  const handleStudy = () => {
    resetQuiz();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main results card */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        <QuizResultsCard
          result={result}
          onStudyAgain={handleStudy}
          onRetry={handleRetry}
          onNewQuiz={handleNewQuiz}
          onReview={() => setShowReview(!showReview)}
        />
      </div>

      {/* Answer review */}
      {showReview && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Answer Review</h3>
          {result.answers.map((answer, i) => {
            const question = quizState.questions[i];
            if (!question) return null;
            return (
              <div key={answer.questionId} className={`rounded-xl border-2 p-4 ${answer.isCorrect ? 'border-emerald-200 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10' : answer.skipped ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' : 'border-red-200 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/10'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{answer.isCorrect ? '✅' : answer.skipped ? '⏭️' : '❌'}</span>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{question.promptLabel}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{question.prompt}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Correct:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{question.correctAnswer}</span>
                      {!answer.isCorrect && !answer.skipped && (
                        <>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 dark:text-gray-400">Your answer:</span>
                          <span className="font-bold text-red-600 dark:text-red-400">{answer.userAnswer}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {Math.round(answer.timeSpent / 1000)}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
