'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import {
  QuizContextState,
  QuizAction,
  QuizConfig,
  QuizQuestion,
  QuizResult,
  UserAnswer,
} from '../types/quizTypes';
import { generateQuestions, validateAnswer } from '../lib/quiz/quizEngine';
import { saveQuizResult, trackElementAnswer } from '../lib/quiz/quizStorage';
import { ElementData } from '../types';

/* ── Initial State ───────────────────────────────────────────────── */
const initialState: QuizContextState = {
  state: 'idle',
  config: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  answers: [],
  timeRemaining: 0,
  questionStartTime: 0,
  hintRevealed: false,
  result: null,
};

/* ── Reducer ─────────────────────────────────────────────────────── */
function quizReducer(state: QuizContextState, action: QuizAction): QuizContextState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...initialState,
        state: 'active',
        config: action.config,
        questions: action.questions,
        currentIndex: 0,
        timeRemaining: action.config.timerEnabled ? action.config.timerSeconds : 0,
        questionStartTime: Date.now(),
      };

    case 'SUBMIT_ANSWER': {
      const question = state.questions[state.currentIndex];
      if (!question || !state.config) return state;

      const validation = validateAnswer(question, action.answer, state.config.strictMode);
      const newStreak = validation.correct ? state.streak + 1 : 0;
      const newBestStreak = Math.max(state.bestStreak, newStreak);

      const userAnswer: UserAnswer = {
        questionId: question.id,
        userAnswer: action.answer,
        isCorrect: validation.correct,
        timeSpent: action.timeSpent,
        hintUsed: state.hintRevealed,
        skipped: false,
      };

      // Track element mastery
      trackElementAnswer(question.element.atomicNumber, validation.correct);

      return {
        ...state,
        state: 'feedback',
        score: validation.correct ? state.score + 1 : state.score,
        streak: newStreak,
        bestStreak: newBestStreak,
        answers: [...state.answers, userAnswer],
        hintRevealed: false,
      };
    }

    case 'SKIP_QUESTION': {
      const question = state.questions[state.currentIndex];
      if (!question) return state;

      const userAnswer: UserAnswer = {
        questionId: question.id,
        userAnswer: '',
        isCorrect: false,
        timeSpent: Date.now() - state.questionStartTime,
        hintUsed: state.hintRevealed,
        skipped: true,
      };

      trackElementAnswer(question.element.atomicNumber, false);

      return {
        ...state,
        state: 'feedback',
        streak: 0,
        answers: [...state.answers, userAnswer],
        hintRevealed: false,
      };
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, state: 'completed' };
      }
      return {
        ...state,
        state: 'active',
        currentIndex: nextIndex,
        timeRemaining: state.config?.timerEnabled ? state.config.timerSeconds : 0,
        questionStartTime: Date.now(),
      };
    }

    case 'REVEAL_HINT':
      return { ...state, hintRevealed: true };

    case 'TICK_TIMER':
      if (state.timeRemaining <= 1) {
        return state; // TIME_UP action will handle this
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 };

    case 'TIME_UP': {
      const question = state.questions[state.currentIndex];
      if (!question) return state;

      const userAnswer: UserAnswer = {
        questionId: question.id,
        userAnswer: '',
        isCorrect: false,
        timeSpent: (state.config?.timerSeconds ?? 30) * 1000,
        hintUsed: state.hintRevealed,
        skipped: false,
      };

      trackElementAnswer(question.element.atomicNumber, false);

      return {
        ...state,
        state: 'feedback',
        streak: 0,
        answers: [...state.answers, userAnswer],
        hintRevealed: false,
      };
    }

    case 'FINISH_QUIZ': {
      if (!state.config) return state;

      const totalTime = state.answers.reduce((sum, a) => sum + a.timeSpent, 0);
      const correctCount = state.answers.filter((a) => a.isCorrect).length;
      const wrongCount = state.answers.filter((a) => !a.isCorrect && !a.skipped).length;
      const skippedCount = state.answers.filter((a) => a.skipped).length;
      const times = state.answers.filter((a) => a.timeSpent > 0).map((a) => a.timeSpent);
      const weakElements = state.answers
        .filter((a) => !a.isCorrect)
        .map((a) => {
          const q = state.questions.find((q) => q.id === a.questionId);
          return q?.element.atomicNumber ?? 0;
        })
        .filter((n) => n > 0);

      const result: QuizResult = {
        id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
        date: new Date().toISOString(),
        config: state.config,
        score: state.score,
        totalQuestions: state.questions.length,
        correctCount,
        wrongCount,
        skippedCount,
        accuracy: state.questions.length > 0 ? (correctCount / state.questions.length) * 100 : 0,
        bestStreak: state.bestStreak,
        totalTime,
        fastestAnswer: times.length > 0 ? Math.min(...times) : 0,
        slowestAnswer: times.length > 0 ? Math.max(...times) : 0,
        answers: state.answers,
        weakElements,
      };

      saveQuizResult(result);

      return { ...state, state: 'completed', result };
    }

    case 'ENTER_REVIEW':
      return { ...state, state: 'review' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────── */
interface QuizContextValue {
  quizState: QuizContextState;
  startQuiz: (config: QuizConfig, elements: ElementData[]) => void;
  submitAnswer: (answer: string) => void;
  skipQuestion: () => void;
  nextQuestion: () => void;
  revealHint: () => void;
  finishQuiz: () => void;
  enterReview: () => void;
  resetQuiz: () => void;
  currentQuestion: QuizQuestion | null;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [quizState, dispatch] = useReducer(quizReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (
      quizState.state === 'active' &&
      quizState.config?.timerEnabled &&
      quizState.timeRemaining > 0
    ) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [quizState.state, quizState.config?.timerEnabled, quizState.timeRemaining, quizState.currentIndex]);

  // Auto time-up
  useEffect(() => {
    if (
      quizState.state === 'active' &&
      quizState.config?.timerEnabled &&
      quizState.timeRemaining <= 0 &&
      quizState.questions.length > 0
    ) {
      dispatch({ type: 'TIME_UP' });
    }
  }, [quizState.timeRemaining, quizState.state, quizState.config?.timerEnabled, quizState.questions.length]);

  const startQuiz = useCallback((config: QuizConfig, elements: ElementData[]) => {
    const questions = generateQuestions(config, elements);
    if (questions.length === 0) return;
    dispatch({ type: 'START_QUIZ', config, questions });
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    if (quizState.state !== 'active') return;
    const timeSpent = Date.now() - quizState.questionStartTime;
    dispatch({ type: 'SUBMIT_ANSWER', answer, timeSpent });
  }, [quizState.state, quizState.questionStartTime]);

  const skipQuestion = useCallback(() => {
    if (quizState.state !== 'active') return;
    dispatch({ type: 'SKIP_QUESTION' });
  }, [quizState.state]);

  const nextQuestion = useCallback(() => {
    if (quizState.state !== 'feedback') return;
    dispatch({ type: 'NEXT_QUESTION' });
  }, [quizState.state]);

  const revealHint = useCallback(() => {
    dispatch({ type: 'REVEAL_HINT' });
  }, []);

  const finishQuiz = useCallback(() => {
    dispatch({ type: 'FINISH_QUIZ' });
  }, []);

  const enterReview = useCallback(() => {
    dispatch({ type: 'ENTER_REVIEW' });
  }, []);

  const resetQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    dispatch({ type: 'RESET' });
  }, []);

  const currentQuestion =
    quizState.questions.length > 0 && quizState.currentIndex < quizState.questions.length
      ? quizState.questions[quizState.currentIndex]
      : null;

  return (
    <QuizContext.Provider
      value={{
        quizState,
        startQuiz,
        submitAnswer,
        skipQuestion,
        nextQuestion,
        revealHint,
        finishQuiz,
        enterReview,
        resetQuiz,
        currentQuestion,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
