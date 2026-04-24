import { ElementData } from '../../types';
import {
  QuizConfig,
  QuizDirection,
  QuizDifficulty,
  QuizFormat,
  QuizOption,
  QuizQuestion,
  QuizScope,
  UserAnswer,
} from '../../types/quizTypes';

/* ── Helper: Generate a unique ID ──────────────────────────────── */
function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ── Helper: Shuffle array (Fisher-Yates) ──────────────────────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── ELEMENT NAME ALIASES ──────────────────────────────────────── */
const NAME_ALIASES: Record<string, string[]> = {
  aluminium: ['aluminum'],
  caesium: ['cesium'],
  sulfur: ['sulphur'],
};

/* ── Scope filter: select elements matching the scope ──────────── */
export function filterByScope(
  elements: ElementData[],
  scope: QuizScope
): ElementData[] {
  switch (scope.type) {
    case 'all':
      return elements;
    case 'period':
      return elements.filter((e) => e.period === scope.value);
    case 'group':
      return elements.filter((e) => e.group === scope.value);
    case 'block':
      return elements.filter(
        (e) => e.block.toLowerCase() === String(scope.value).toLowerCase()
      );
    case 'category':
      return elements.filter(
        (e) => e.category.toLowerCase() === String(scope.value).toLowerCase()
      );
    case 'favorites':
    case 'weak':
      // value is expected to be an array of atomic numbers
      if (Array.isArray(scope.value)) {
        const set = new Set(scope.value);
        return elements.filter((e) => set.has(e.atomicNumber));
      }
      return elements;
    default:
      return elements;
  }
}

/* ── Format atomic mass for display ───────────────────────────── */
export function formatWeight(w: number | string): string {
  if (typeof w === 'string') return w.replace(/[()]/g, '');
  return w.toFixed(3);
}

/* ── Generate prompt and correct answer for a direction ─────── */
function buildPromptAnswer(
  element: ElementData,
  direction: QuizDirection
): { promptLabel: string; prompt: string; correctAnswer: string; acceptedAnswers: string[]; answerType: 'number' | 'text' | 'element-select' } {
  const name = element.name;
  const symbol = element.symbol;
  const number = String(element.atomicNumber);
  const weight = formatWeight(element.atomicMass);
  const nameAliases = NAME_ALIASES[name.toLowerCase()] ?? [];

  switch (direction) {
    case 'name-to-number':
      return {
        promptLabel: 'What is the atomic number of',
        prompt: name,
        correctAnswer: number,
        acceptedAnswers: [number],
        answerType: 'number',
      };
    case 'name-to-symbol':
      return {
        promptLabel: 'What is the chemical symbol for',
        prompt: name,
        correctAnswer: symbol,
        acceptedAnswers: [symbol, symbol.toLowerCase(), symbol.toUpperCase()],
        answerType: 'text',
      };
    case 'name-to-weight':
      return {
        promptLabel: 'What is the atomic weight of',
        prompt: name,
        correctAnswer: weight,
        acceptedAnswers: [weight],
        answerType: 'number',
      };
    case 'number-to-name':
      return {
        promptLabel: 'Which element has atomic number',
        prompt: number,
        correctAnswer: name,
        acceptedAnswers: [name, name.toLowerCase(), ...nameAliases],
        answerType: 'text',
      };
    case 'symbol-to-name':
      return {
        promptLabel: 'Which element has the symbol',
        prompt: symbol,
        correctAnswer: name,
        acceptedAnswers: [name, name.toLowerCase(), ...nameAliases],
        answerType: 'text',
      };
    case 'weight-to-name':
      return {
        promptLabel: 'Which element has an atomic weight of',
        prompt: weight,
        correctAnswer: name,
        acceptedAnswers: [name, name.toLowerCase(), ...nameAliases],
        answerType: 'text',
      };
  }
}

/* ── Generate plausible distractors ───────────────────────────── */
function generateDistractors(
  element: ElementData,
  direction: QuizDirection,
  allElements: ElementData[],
  count: number
): string[] {
  // Pick distractors that are plausible: same category first, nearby period, then random
  const sameCategory = allElements.filter(
    (e) => e.category === element.category && e.atomicNumber !== element.atomicNumber
  );
  const samePeriod = allElements.filter(
    (e) => e.period === element.period && e.atomicNumber !== element.atomicNumber
  );
  const nearby = allElements.filter(
    (e) =>
      Math.abs(e.atomicNumber - element.atomicNumber) <= 10 &&
      e.atomicNumber !== element.atomicNumber
  );

  // Merge candidates, prioritize category > period > nearby > all
  const candidatePool = [
    ...shuffle(sameCategory).slice(0, count * 2),
    ...shuffle(samePeriod).slice(0, count),
    ...shuffle(nearby).slice(0, count),
  ];

  // Deduplicate
  const seen = new Set<number>([element.atomicNumber]);
  const unique: ElementData[] = [];
  for (const c of candidatePool) {
    if (!seen.has(c.atomicNumber)) {
      seen.add(c.atomicNumber);
      unique.push(c);
    }
  }

  // Fill from all elements if we don't have enough
  if (unique.length < count) {
    for (const e of shuffle(allElements)) {
      if (!seen.has(e.atomicNumber)) {
        seen.add(e.atomicNumber);
        unique.push(e);
        if (unique.length >= count) break;
      }
    }
  }

  // Extract the answer value based on direction
  return unique.slice(0, count).map((e) => {
    switch (direction) {
      case 'name-to-number':
        return String(e.atomicNumber);
      case 'name-to-symbol':
        return e.symbol;
      case 'name-to-weight':
        return formatWeight(e.atomicMass);
      case 'number-to-name':
      case 'symbol-to-name':
      case 'weight-to-name':
        return e.name;
    }
  });
}

/* ── Build hint for a question ────────────────────────────────── */
function buildHint(element: ElementData, direction: QuizDirection): string {
  switch (direction) {
    case 'name-to-number':
      return `This element is in period ${element.period}, group ${element.group > 0 ? element.group : 'N/A'}.`;
    case 'name-to-symbol':
      return `The symbol starts with "${element.symbol[0]}".`;
    case 'name-to-weight':
      return `The weight is between ${Math.floor(Number(element.atomicMass) || 0) - 2} and ${Math.ceil(Number(element.atomicMass) || 0) + 2}.`;
    case 'number-to-name':
      return `This element is a ${element.category} in the ${element.block}-block.`;
    case 'symbol-to-name':
      return `This element is a ${element.category} with atomic number ${element.atomicNumber}.`;
    case 'weight-to-name':
      return `This element is in period ${element.period} and is a ${element.category}.`;
  }
}

/* ── Build explanation ────────────────────────────────────────── */
function buildExplanation(element: ElementData, direction: QuizDirection): string {
  const base = `${element.name} (${element.symbol}) is element #${element.atomicNumber}, a ${element.category} in period ${element.period}.`;
  switch (direction) {
    case 'name-to-number':
      return `${base} Its atomic number is ${element.atomicNumber}.`;
    case 'name-to-symbol':
      return `${base} Its symbol "${element.symbol}" comes from ${element.name.startsWith(element.symbol) ? 'its name' : 'its Latin name'}.`;
    case 'name-to-weight':
      return `${base} Its atomic weight is ${formatWeight(element.atomicMass)}.`;
    default:
      return base;
  }
}

/* ═══ MAIN: Generate Questions ═══════════════════════════════════ */
export function generateQuestions(
  config: QuizConfig,
  allElements: ElementData[]
): QuizQuestion[] {
  const pool = filterByScope(allElements, config.scope);
  if (pool.length === 0) return [];

  // Pick elements for questions
  const count = Math.min(config.questionCount, pool.length);
  const selected = config.shuffleQuestions ? shuffle(pool).slice(0, count) : pool.slice(0, count);

  return selected.map((element): QuizQuestion => {
    const { promptLabel, prompt, correctAnswer, acceptedAnswers, answerType } =
      buildPromptAnswer(element, config.direction);

    // Build options for multiple choice
    let options: QuizOption[] = [];
    if (config.format === 'multiple-choice') {
      const distractors = generateDistractors(
        element,
        config.direction,
        allElements,
        config.optionCount - 1
      );

      const allOptions = [
        { label: correctAnswer, value: correctAnswer, isCorrect: true },
        ...distractors.map((d) => ({ label: d, value: d, isCorrect: false })),
      ];

      options = (config.shuffleOptions ? shuffle(allOptions) : allOptions).map(
        (o, i) => ({ ...o, id: `opt-${i}` })
      );
    }

    // For find-on-table, answer type is element-select
    const finalAnswerType: 'number' | 'text' | 'element-select' =
      config.format === 'find-on-table' ? 'element-select' : answerType;

    return {
      id: uid(),
      format: config.format,
      direction: config.direction,
      prompt,
      promptLabel,
      answerType: finalAnswerType,
      correctAnswer,
      acceptedAnswers,
      options,
      element,
      hint: buildHint(element, config.direction),
      explanation: buildExplanation(element, config.direction),
      difficulty: config.difficulty,
      category: element.category,
    };
  });
}

/* ═══ ANSWER VALIDATION ═════════════════════════════════════════ */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
}

export function validateAnswer(
  question: QuizQuestion,
  userAnswer: string,
  strict: boolean = false
): { correct: boolean; normalized: string; explanation: string } {
  const normalized = normalizeAnswer(userAnswer);
  const explanation = question.explanation;

  // Element-select (find on table) — compare atomic number
  if (question.answerType === 'element-select') {
    const correct = normalized === normalizeAnswer(String(question.element.atomicNumber));
    return { correct, normalized, explanation };
  }

  // Numeric matching (atomic number or weight)
  if (question.answerType === 'number') {
    const userNum = parseFloat(userAnswer.trim());
    const correctNum = parseFloat(question.correctAnswer);

    if (!isNaN(userNum) && !isNaN(correctNum)) {
      // Exact match for atomic number
      if (question.direction === 'name-to-number') {
        return { correct: userNum === correctNum, normalized, explanation };
      }
      // Tolerance for weight (±0.5)
      return {
        correct: Math.abs(userNum - correctNum) <= 0.5,
        normalized,
        explanation,
      };
    }
    return { correct: false, normalized, explanation };
  }

  // Text matching
  if (strict) {
    // Strict: must match correct answer exactly (case-insensitive)
    const correct = normalized === normalizeAnswer(question.correctAnswer);
    return { correct, normalized, explanation };
  }

  // Lenient: check against all accepted answers
  const correct = question.acceptedAnswers.some(
    (a) => normalizeAnswer(a) === normalized
  );
  return { correct, normalized, explanation };
}

/* ═══ DEFAULT CONFIG ═════════════════════════════════════════════ */
export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  format: 'multiple-choice',
  direction: 'name-to-symbol',
  questionCount: 10,
  scope: { type: 'all' },
  difficulty: 'normal',
  timerEnabled: false,
  timerSeconds: 30,
  soundEnabled: true,
  shuffleQuestions: true,
  shuffleOptions: true,
  optionCount: 4,
  strictMode: false,
};
