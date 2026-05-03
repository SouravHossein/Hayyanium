import { ElementCategory, ElementData } from './index';

/* ── Quiz State Machine ──────────────────────────────────────────── */
export type QuizState =
  | 'idle'
  | 'setup'
  | 'loading'
  | 'active'
  | 'answer-locked'
  | 'feedback'
  | 'next-question'
  | 'completed'
  | 'review';

/* ── Quiz Format ─────────────────────────────────────────────────── */
export type QuizFormat = 'find-on-table' | 'multiple-choice' | 'text-input';

/* ── Question Direction ──────────────────────────────────────────── */
export type QuizDirection =
  | 'name-to-number'
  | 'name-to-symbol'
  | 'name-to-weight'
  | 'number-to-name'
  | 'symbol-to-name'
  | 'weight-to-name';

/* ── Difficulty ──────────────────────────────────────────────────── */
export type QuizDifficulty = 'easy' | 'normal' | 'hard';

/* ── Element Scope ───────────────────────────────────────────────── */
export interface QuizScope {
  type: 'all' | 'period' | 'group' | 'block' | 'category' | 'favorites' | 'weak';
  value?: number | string | number[]; // period/group number, block letter, category string, or array of atomic numbers
}

/* ── Quiz Config ─────────────────────────────────────────────────── */
export interface QuizConfig {
  format: QuizFormat;
  direction: QuizDirection;
  questionCount: number;
  scope: QuizScope;
  difficulty: QuizDifficulty;
  timerEnabled: boolean;
  timerSeconds: number; // seconds per question
  soundEnabled: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  optionCount: number; // 3, 4, 5, or 6 for multiple choice
  strictMode: boolean; // exact matching for text input
  showAtomicWeightDecimals: boolean; // show full decimals or rounded
  missionType?: string; // Optional identifier for RPG missions
}

/* ── Quiz Question ───────────────────────────────────────────────── */
export interface QuizQuestion {
  id: string;
  format: QuizFormat;
  direction: QuizDirection;
  prompt: string;
  promptLabel: string; // e.g., "What is the atomic number of..."
  answerType: 'number' | 'text' | 'element-select';
  correctAnswer: string;
  acceptedAnswers: string[]; // case-insensitive alternatives
  options: QuizOption[]; // for multiple choice
  element: ElementData;
  hint: string;
  explanation: string;
  difficulty: QuizDifficulty;
  category: ElementCategory;
}

export interface QuizOption {
  id: string;
  label: string;
  value: string;
  isCorrect: boolean;
}

/* ── User Answer ─────────────────────────────────────────────────── */
export interface UserAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // ms
  hintUsed: boolean;
  skipped: boolean;
}

/* ── Quiz Result (persisted) ─────────────────────────────────────── */
export interface QuizResult {
  id: string;
  date: string; // ISO string
  config: QuizConfig;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracy: number; // 0-100
  bestStreak: number;
  totalTime: number; // ms
  fastestAnswer: number; // ms
  slowestAnswer: number; // ms
  answers: UserAnswer[];
  weakElements: number[]; // atomic numbers
}

/* ── Element Mastery ─────────────────────────────────────────────── */
export interface ElementMastery {
  atomicNumber: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number; // 0-100
  lastAttempted: string; // ISO string
  status: 'untested' | 'weak' | 'learning' | 'mastered';
}

/* ── Quiz Progress (aggregated) ──────────────────────────────────── */
export interface QuizProgress {
  totalQuizzes: number;
  totalQuestions: number;
  overallAccuracy: number;
  bestScore: number;
  currentStreak: number; // days
  longestStreak: number;
  lastPlayedDate: string | null;
  elementMastery: Record<number, ElementMastery>; // keyed by atomic number
  masteredCount: number;
  weakCount: number;
}

/* ── Quiz Settings (persisted) ───────────────────────────────────── */
export interface QuizSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timerEnabled: boolean;
  defaultTimerSeconds: number;
  defaultQuestionCount: number;
  defaultOptionCount: number;
  strictAnswerChecking: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showAtomicWeightDecimals: boolean;
}

/* ── Quiz Context State ──────────────────────────────────────────── */
export interface QuizContextState {
  state: QuizState;
  config: QuizConfig | null;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: UserAnswer[];
  timeRemaining: number;
  questionStartTime: number;
  hintRevealed: boolean;
  result: QuizResult | null;
}

export type QuizAction =
  | { type: 'START_QUIZ'; config: QuizConfig; questions: QuizQuestion[] }
  | { type: 'SUBMIT_ANSWER'; answer: string; timeSpent: number }
  | { type: 'SKIP_QUESTION' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'REVEAL_HINT' }
  | { type: 'TICK_TIMER' }
  | { type: 'TIME_UP' }
  | { type: 'FINISH_QUIZ' }
  | { type: 'ENTER_REVIEW' }
  | { type: 'RESET' };
