'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuiz } from '@/contexts/QuizContext';
import QuizProgressBar from '@/components/quiz/QuizProgressBar';
import MultipleChoiceQuestion from '@/components/quiz/MultipleChoiceQuestion';
import TextInputQuestion from '@/components/quiz/TextInputQuestion';
import FindOnTableQuestion from '@/components/quiz/FindOnTableQuestion';
import { ArrowRight, Atom, Flag } from '@/components/icons';

export default function QuizPlayPage() {
  const router = useRouter();
  const { quizState, currentQuestion, submitAnswer, skipQuestion, nextQuestion, revealHint, finishQuiz } = useQuiz();

  // Redirect if no active quiz
  useEffect(() => {
    if (quizState.state === 'idle' && quizState.questions.length === 0) {
      router.replace('/quiz/setup');
    }
  }, [quizState.state, quizState.questions.length, router]);

  // Auto-navigate to results on completion
  useEffect(() => {
    if (quizState.state === 'completed' && quizState.result) {
      router.push('/quiz/results');
    }
  }, [quizState.state, quizState.result, router]);

  // Handle finish when quiz completes via NEXT_QUESTION
  useEffect(() => {
    if (quizState.state === 'completed' && !quizState.result) {
      finishQuiz();
    }
  }, [quizState.state, quizState.result, finishQuiz]);

  if (!currentQuestion || !quizState.config) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Atom className="mx-auto h-10 w-10 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const isFeedback = quizState.state === 'feedback';
  const lastAnswer = quizState.answers.length > 0 ? quizState.answers[quizState.answers.length - 1] : null;
  const userAnswerStr = isFeedback && lastAnswer ? lastAnswer.userAnswer : null;

  const handleNext = () => {
    if (quizState.currentIndex >= quizState.questions.length - 1) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <QuizProgressBar
        current={quizState.currentIndex}
        total={quizState.questions.length}
        score={quizState.score}
        streak={quizState.streak}
        timeRemaining={quizState.timeRemaining}
        timerEnabled={quizState.config.timerEnabled}
      />

      {/* Question content */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        {currentQuestion.format === 'multiple-choice' && (
          <MultipleChoiceQuestion
            question={currentQuestion}
            onAnswer={submitAnswer}
            disabled={isFeedback}
            showFeedback={isFeedback}
            userAnswer={userAnswerStr}
          />
        )}

        {currentQuestion.format === 'text-input' && (
          <TextInputQuestion
            question={currentQuestion}
            onAnswer={submitAnswer}
            onSkip={skipQuestion}
            disabled={isFeedback}
            showFeedback={isFeedback}
            userAnswer={userAnswerStr}
            hintRevealed={quizState.hintRevealed}
            onRevealHint={revealHint}
          />
        )}

        {currentQuestion.format === 'find-on-table' && (
          <FindOnTableQuestion
            question={currentQuestion}
            onAnswer={submitAnswer}
            disabled={isFeedback}
            showFeedback={isFeedback}
            userAnswer={userAnswerStr}
            hintRevealed={quizState.hintRevealed}
            onRevealHint={revealHint}
          />
        )}
      </div>

      {/* Next / Skip buttons */}
      <div className="flex gap-3">
        {isFeedback && (
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {quizState.currentIndex >= quizState.questions.length - 1 ? <Flag className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              {quizState.currentIndex >= quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </span>
          </button>
        )}

        {!isFeedback && currentQuestion.format === 'multiple-choice' && (
          <button
            onClick={skipQuestion}
            className="ml-auto rounded-xl border-2 border-gray-200 dark:border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <span className="inline-flex items-center gap-2">Skip <ArrowRight className="h-4 w-4" /></span>
          </button>
        )}
      </div>

      {/* Quit quiz */}
      <div className="text-center">
        <button
          onClick={() => { finishQuiz(); }}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          End quiz early
        </button>
      </div>
    </div>
  );
}
