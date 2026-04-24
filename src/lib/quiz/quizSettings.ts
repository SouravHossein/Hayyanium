import { QuizSettings } from '../../types/quizTypes';

const SETTINGS_KEY = 'hayyanium_quiz_settings';

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  soundEnabled: true,
  vibrationEnabled: false,
  timerEnabled: false,
  defaultTimerSeconds: 30,
  defaultQuestionCount: 10,
  defaultOptionCount: 4,
  strictAnswerChecking: false,
  reducedMotion: false,
  fontSize: 'medium',
  showAtomicWeightDecimals: true,
};

export function getQuizSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge with defaults (forward compat)
      return { ...DEFAULT_QUIZ_SETTINGS, ...saved };
    }
  } catch { /* empty */ }
  return { ...DEFAULT_QUIZ_SETTINGS };
}

export function saveQuizSettings(settings: Partial<QuizSettings>): void {
  const current = getQuizSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}

export function resetQuizSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}
