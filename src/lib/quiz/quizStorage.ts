import { QuizResult, QuizProgress, ElementMastery } from '../../types/quizTypes';

const STORAGE_KEY = 'hayyanium_quiz_history';
const STREAK_KEY = 'hayyanium_quiz_streak';

/* ── Save a quiz result ──────────────────────────────────────────── */
export function saveQuizResult(result: QuizResult): void {
  const history = getQuizHistory();
  history.unshift(result); // newest first
  // Keep last 200 results
  if (history.length > 200) history.length = 200;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  updateStreak();
}

/* ── Get full quiz history ──────────────────────────────────────── */
export function getQuizHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ── Get filtered history ────────────────────────────────────────── */
export function getFilteredHistory(filters: {
  format?: string;
  difficulty?: string;
  dateFrom?: string;
  dateTo?: string;
}): QuizResult[] {
  let results = getQuizHistory();

  if (filters.format) {
    results = results.filter((r) => r.config.format === filters.format);
  }
  if (filters.difficulty) {
    results = results.filter((r) => r.config.difficulty === filters.difficulty);
  }
  if (filters.dateFrom) {
    results = results.filter((r) => r.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    results = results.filter((r) => r.date <= filters.dateTo!);
  }

  return results;
}

/* ── Compute element mastery across all history ─────────────────── */
export function getElementMastery(): Record<number, ElementMastery> {
  const history = getQuizHistory();
  const mastery: Record<number, ElementMastery> = {};

  for (const result of history) {
    for (const answer of result.answers) {
      // Extract atomic number from the question config
      // We need to find the question to get the element
      const question = result.answers.indexOf(answer);
      // Use the answer's questionId to find matching config info
      // Since we store minimal data, we rely on the result's answer pattern
    }
  }

  // Better approach: iterate through results and their answers
  // We embed element info in the result
  for (const result of history) {
    for (let i = 0; i < result.answers.length; i++) {
      const answer = result.answers[i];
      // The weakElements array tells us which ones were wrong
      // But we need per-element tracking. Let's use a smarter approach:
      // Parse the questionId which won't help since it's random.
      // Instead, we track by the answer data available.
    }

    // Track weak elements from the result
    for (const atomicNumber of result.weakElements) {
      if (!mastery[atomicNumber]) {
        mastery[atomicNumber] = {
          atomicNumber,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          lastAttempted: result.date,
          status: 'untested',
        };
      }
      mastery[atomicNumber].totalAttempts++;
      mastery[atomicNumber].lastAttempted = result.date;
    }
  }

  // Recalculate status for each
  for (const m of Object.values(mastery)) {
    m.accuracy = m.totalAttempts > 0 ? (m.correctAttempts / m.totalAttempts) * 100 : 0;
    if (m.totalAttempts === 0) m.status = 'untested';
    else if (m.accuracy >= 90 && m.totalAttempts >= 3) m.status = 'mastered';
    else if (m.accuracy < 50) m.status = 'weak';
    else m.status = 'learning';
  }

  return mastery;
}

/* ── Enhanced mastery tracking with per-element answer data ──────── */
export function trackElementAnswer(
  atomicNumber: number,
  correct: boolean
): void {
  const key = 'hayyanium_element_mastery';
  let mastery: Record<number, ElementMastery> = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) mastery = JSON.parse(raw);
  } catch { /* empty */ }

  if (!mastery[atomicNumber]) {
    mastery[atomicNumber] = {
      atomicNumber,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      lastAttempted: new Date().toISOString(),
      status: 'untested',
    };
  }

  const m = mastery[atomicNumber];
  m.totalAttempts++;
  if (correct) m.correctAttempts++;
  m.accuracy = (m.correctAttempts / m.totalAttempts) * 100;
  m.lastAttempted = new Date().toISOString();

  if (m.accuracy >= 90 && m.totalAttempts >= 3) m.status = 'mastered';
  else if (m.accuracy < 50) m.status = 'weak';
  else m.status = 'learning';

  localStorage.setItem(key, JSON.stringify(mastery));
}

export function getPerElementMastery(): Record<number, ElementMastery> {
  const key = 'hayyanium_element_mastery';
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* ── Get weak elements (accuracy < 50%) ──────────────────────────── */
export function getWeakElements(): number[] {
  const mastery = getPerElementMastery();
  return Object.values(mastery)
    .filter((m) => m.status === 'weak')
    .map((m) => m.atomicNumber);
}

/* ── Get mastered elements (accuracy > 90%, 3+ attempts) ─────── */
export function getMasteredElements(): number[] {
  const mastery = getPerElementMastery();
  return Object.values(mastery)
    .filter((m) => m.status === 'mastered')
    .map((m) => m.atomicNumber);
}

/* ── Streak tracking ─────────────────────────────────────────────── */
function updateStreak(): void {
  const today = new Date().toISOString().split('T')[0];
  let streak = { current: 0, longest: 0, lastDate: '' };

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) streak = JSON.parse(raw);
  } catch { /* empty */ }

  if (streak.lastDate === today) {
    // Already played today
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streak.lastDate === yesterdayStr) {
    streak.current++;
  } else {
    streak.current = 1;
  }

  streak.longest = Math.max(streak.longest, streak.current);
  streak.lastDate = today;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

export function getStreak(): { current: number; longest: number } {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { current: data.current || 0, longest: data.longest || 0 };
    }
  } catch { /* empty */ }
  return { current: 0, longest: 0 };
}

/* ── Build full progress summary ─────────────────────────────────── */
export function getQuizProgress(): QuizProgress {
  const history = getQuizHistory();
  const mastery = getPerElementMastery();
  const streak = getStreak();

  const totalQuestions = history.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrect = history.reduce((sum, r) => sum + r.correctCount, 0);

  return {
    totalQuizzes: history.length,
    totalQuestions,
    overallAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
    bestScore: history.length > 0 ? Math.max(...history.map((r) => r.accuracy)) : 0,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    lastPlayedDate: history.length > 0 ? history[0].date : null,
    elementMastery: mastery,
    masteredCount: Object.values(mastery).filter((m) => m.status === 'mastered').length,
    weakCount: Object.values(mastery).filter((m) => m.status === 'weak').length,
  };
}

/* ── Clear all quiz data ─────────────────────────────────────────── */
export function clearQuizHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem('hayyanium_element_mastery');
}
