'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Drawer } from 'vaul';

import { useQuiz } from '@/contexts/QuizContext';
import { useFavorites } from '@/hooks/useFavorites';
import { allElementsData } from '@/data/elements';
import { DEFAULT_QUIZ_CONFIG } from '@/lib/quiz/quizEngine';
import { getQuizSettings } from '@/lib/quiz/quizSettings';
import { getWeakElements } from '@/lib/quiz/quizStorage';
import { QuizConfig, QuizDifficulty, QuizDirection, QuizFormat, QuizScope } from '@/types/quizTypes';
import {
  ArrowLeft,
  ArrowRight,
  CircleDot,
  Flame,
  FlaskConical,
  Map,
  PencilLine,
  Rocket,
  Settings,
  Shuffle,
  Sparkles,
  Target,
} from '@/components/icons';

const FORMAT_ICONS: Record<QuizFormat, React.ComponentType<{ className?: string }>> = {
  'multiple-choice': CircleDot,
  'text-input': PencilLine,
  'find-on-table': Map,
};

const FORMATS: { value: QuizFormat; label: string; desc: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice', desc: 'Pick the correct answer from options' },
  { value: 'text-input', label: 'Type Answer', desc: 'Type the answer with autocomplete' },
  { value: 'find-on-table', label: 'Find on Table', desc: 'Tap the correct element on the table' },
];

const DIRECTIONS: { value: QuizDirection; label: string }[] = [
  { value: 'name-to-symbol', label: 'Name → Symbol' },
  { value: 'symbol-to-name', label: 'Symbol → Name' },
  { value: 'name-to-number', label: 'Name → Atomic Number' },
  { value: 'number-to-name', label: 'Atomic Number → Name' },
  { value: 'name-to-weight', label: 'Name → Atomic Weight' },
  { value: 'weight-to-name', label: 'Atomic Weight → Name' },
];

const COMMON_DIRECTIONS: QuizDirection[] = ['name-to-symbol', 'number-to-name', 'symbol-to-name'];
const QUESTION_COUNT_POINTS = [5, 10, 15, 20, 30, 50];

const CATEGORIES = [
  'alkali metal',
  'alkaline earth metal',
  'transition metal',
  'post-transition metal',
  'metalloid',
  'nonmetal',
  'halogen',
  'noble gas',
  'lanthanide',
  'actinide',
];

type Step = 1 | 2 | 3 | 4;

function clampToScopeCount(questionCount: number, scopeCount: number) {
  if (scopeCount <= 0) return questionCount;
  return Math.max(1, Math.min(questionCount, scopeCount));
}

function scopeLabel(scope: QuizScope) {
  switch (scope.type) {
    case 'all':
      return 'All elements';
    case 'favorites':
      return 'Favorites';
    case 'weak':
      return 'Weak elements';
    case 'period':
      return `Period ${scope.value ?? ''}`.trim();
    case 'block':
      return `${String(scope.value ?? '').toLowerCase()}-block`;
    case 'category':
      return String(scope.value ?? '');
    case 'group':
      return `Group ${scope.value ?? ''}`.trim();
    default:
      return 'All elements';
  }
}

function directionPreview(direction: QuizDirection) {
  switch (direction) {
    case 'name-to-symbol':
      return { prompt: 'Oxygen', answer: 'O' };
    case 'name-to-number':
      return { prompt: 'Oxygen', answer: '8' };
    case 'name-to-weight':
      return { prompt: 'Oxygen', answer: '15.999' };
    case 'number-to-name':
      return { prompt: '8', answer: 'Oxygen' };
    case 'symbol-to-name':
      return { prompt: 'O', answer: 'Oxygen' };
    case 'weight-to-name':
      return { prompt: '15.999', answer: 'Oxygen' };
    default:
      return { prompt: 'Oxygen', answer: 'O' };
  }
}

function getScopeCount(scope: QuizScope, favorites: number[], weakElements: number[]) {
  switch (scope.type) {
    case 'all':
      return 118;
    case 'period':
      return allElementsData.filter((e) => e.period === scope.value).length;
    case 'group':
      return allElementsData.filter((e) => e.group === scope.value).length;
    case 'block':
      return allElementsData.filter((e) => e.block === scope.value).length;
    case 'category':
      return allElementsData.filter((e) => e.category === scope.value).length;
    case 'favorites':
      return favorites.length;
    case 'weak':
      return weakElements.length;
    default:
      return 118;
  }
}

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="card p-5 sm:p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
      <h2 className="text-lg font-black uppercase tracking-wider">{title}</h2>
    </div>
    {children}
  </section>
);

export default function QuizSetupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startQuiz } = useQuiz();
  const [favorites] = useFavorites();

  const settings = typeof window !== 'undefined' ? getQuizSettings() : null;
  const reducedMotion = settings?.reducedMotion ?? false;
  const motionHover = reducedMotion ? '' : 'hover:scale-[1.02] active:scale-[0.98]';

  const [step, setStep] = useState<Step>(1);
  const [showMoreDirections, setShowMoreDirections] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const weakElements = useMemo(
    () => (typeof window !== 'undefined' ? getWeakElements() : []),
    [],
  );

  const [config, setConfig] = useState<QuizConfig>(() => {
    const c: QuizConfig = { ...DEFAULT_QUIZ_CONFIG };

    if (settings) {
      c.soundEnabled = settings.soundEnabled;
      c.timerEnabled = settings.timerEnabled;
      c.timerSeconds = settings.defaultTimerSeconds;
      c.questionCount = settings.defaultQuestionCount || 10;
      c.optionCount = settings.defaultOptionCount;
      c.strictMode = settings.strictAnswerChecking;
      c.showAtomicWeightDecimals = settings.showAtomicWeightDecimals;
    } else {
      c.questionCount = 10;
    }

    const f = searchParams.get('format');
    if (f && (['multiple-choice', 'text-input', 'find-on-table'] as string[]).includes(f)) {
      c.format = f as QuizFormat;
    }
    const d = searchParams.get('direction');
    if (d) c.direction = d as QuizDirection;
    const scope = searchParams.get('scope');
    const scopeValue = searchParams.get('scopeValue');
    if (scope === 'block' && scopeValue) c.scope = { type: 'block', value: scopeValue };

    return c;
  });

  const updateConfig = (patch: Partial<QuizConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const scopeCount = useMemo(
    () => getScopeCount(config.scope, favorites, weakElements),
    [config.scope, favorites, weakElements],
  );

  const canContinueFromScope = scopeCount >= 2;

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [categorySearch]);

  const handleStart = () => {
    let resolvedConfig: QuizConfig = { ...config };

    if (resolvedConfig.scope.type === 'favorites') {
      resolvedConfig.scope = { type: 'favorites', value: favorites };
    } else if (resolvedConfig.scope.type === 'weak') {
      resolvedConfig.scope = { type: 'weak', value: getWeakElements() };
    }

    startQuiz(resolvedConfig, allElementsData);
    router.push('/quiz/play');
  };

  const goNext = () => {
    if (step === 1 && !canContinueFromScope) return;
    setStep((s) => (Math.min(4, s + 1) as Step));
  };

  const goBack = () => setStep((s) => (Math.max(1, s - 1) as Step));

  const StepPill = ({ n, label }: { n: Step; label: string }) => {
    const active = step === n;
    const done = step > n;
    return (
      <button
        type="button"
        onClick={() => setStep(n)}
        className={`rounded-full border-2 px-3 py-1 text-xs font-black transition-all ${
          active
            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
            : done
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
              active
                ? 'border-cyan-400'
                : done
                  ? 'border-emerald-400'
                  : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {n}
          </span>
          {label}
        </span>
      </button>
    );
  };

  const ScopeTypeChip = ({
    type,
    label,
    icon: Icon,
  }: {
    type: QuizScope['type'];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active = config.scope.type === type;
    return (
      <button
        type="button"
        onClick={() => {
          const nextScope: QuizScope =
            type === 'period'
              ? { type, value: 1 }
              : type === 'block'
                ? { type, value: 's' }
                : type === 'category'
                  ? { type, value: 'nonmetal' }
                  : { type };
          updateConfig({ scope: nextScope });
        }}
        className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-bold transition-all ${
          active
            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const Footer = () => {
    const primaryDisabled =
      step === 1 ? !canContinueFromScope : step === 4 ? scopeCount < 2 : false;
    const primaryLabel =
      step === 4
        ? `Start Quiz (${clampToScopeCount(config.questionCount, scopeCount)} questions)`
        : 'Next';

    return (
      <div className="sticky bottom-0 z-40 -mx-4 sm:mx-0 px-4 sm:px-0 pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/70 backdrop-blur p-3 shadow-lg">
          {step === 1 && !canContinueFromScope && (
            <div className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              Need at least 2 elements in scope to continue.
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className={`retro-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black ${
                step === 1 ? 'opacity-40' : ''
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step === 3 && (
              <button
                type="button"
                onClick={() => setAdvancedOpen(true)}
                className={`retro-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black ${motionHover}`}
              >
                <Settings className="h-4 w-4" />
                Advanced
              </button>
            )}

            <button
              type="button"
              onClick={step === 4 ? handleStart : goNext}
              disabled={primaryDisabled}
              className={`rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/30 transition-all ${
                reducedMotion ? '' : 'hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]'
              } disabled:opacity-40 disabled:hover:scale-100`}
            >
              <span className="inline-flex items-center gap-2">
                {step === 4 ? <Rocket className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                {primaryLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 sm:px-0">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Quiz Setup
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Guided setup—pick a few things and start learning.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StepPill n={1} label="Scope" />
          <StepPill n={2} label="Mode" />
          <StepPill n={3} label="Challenge" />
          <StepPill n={4} label="Review" />
        </div>
      </header>

      {step === 1 && (
        <SectionCard title="Pick What to Practice" icon={Target}>
          <div className="flex flex-wrap gap-2 mb-4">
            <ScopeTypeChip type="all" label="All" icon={Target} />
            <ScopeTypeChip
              type="favorites"
              label={`Favorites (${favorites.length})`}
              icon={Sparkles}
            />
            <ScopeTypeChip type="weak" label={`Weak (${weakElements.length})`} icon={Flame} />
            <ScopeTypeChip type="period" label="Period" icon={FlaskConical} />
            <ScopeTypeChip type="block" label="Block" icon={CircleDot} />
            <ScopeTypeChip type="category" label="Category" icon={Map} />
          </div>

          <div className="text-sm font-bold opacity-80 mb-3">
            Selected: <span className="capitalize">{scopeLabel(config.scope)}</span> ·{' '}
            <span>{scopeCount} elements</span>
          </div>

          {config.scope.type === 'favorites' && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/50">
              <div className="text-sm font-black">Favorites</div>
              <div className="text-xs font-bold opacity-80 mt-1">
                Uses the elements you starred in the table. Add more favorites if this
                stays under 2.
              </div>
            </div>
          )}

          {config.scope.type === 'weak' && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/50">
              <div className="text-sm font-black">Weak elements</div>
              <div className="text-xs font-bold opacity-80 mt-1">
                Based on your recent quiz mistakes. Take a few quizzes first if this is
                empty.
              </div>
            </div>
          )}

          {config.scope.type === 'period' && (
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider opacity-70">
                Choose a period
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateConfig({ scope: { type: 'period', value: p } })}
                    className={`retro-btn px-4 py-2 text-sm font-black ${
                      config.scope.value === p ? 'bg-[var(--color-actinide)]' : 'bg-white'
                    } ${motionHover}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.scope.type === 'block' && (
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider opacity-70">
                Choose a block
              </div>
              <div className="flex flex-wrap gap-2">
                {['s', 'p', 'd', 'f'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => updateConfig({ scope: { type: 'block', value: b } })}
                    className={`retro-btn px-4 py-2 text-sm font-black ${
                      String(config.scope.value) === b ? 'bg-[var(--color-actinide)]' : 'bg-white'
                    } ${motionHover}`}
                  >
                    {b.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.scope.type === 'category' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-wider opacity-70">
                  Choose a category
                </div>
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search…"
                  className="h-9 w-40 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm font-bold"
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-auto custom-scrollbar pr-1">
                {filteredCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateConfig({ scope: { type: 'category', value: c } })}
                    className={`rounded-full border-2 px-3 py-2 text-sm font-black capitalize transition-all ${
                      config.scope.type === 'category' && config.scope.value === c
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-sm font-bold opacity-70">No matches.</div>
                )}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {step === 2 && (
        <SectionCard title="Pick How You’ll Answer" icon={CircleDot}>
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            {FORMATS.map((f) => {
              const active = config.format === f.value;
              const Icon = FORMAT_ICONS[f.value];
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => updateConfig({ format: f.value })}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    active
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-cyan-300'
                  } ${motionHover}`}
                >
                  <Icon className="h-6 w-6 mb-2 text-cyan-600 dark:text-cyan-400" />
                  <div className="text-sm font-black">{f.label}</div>
                  <div className="text-xs font-bold opacity-70 mt-1">{f.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40 mb-4">
            {(() => {
              const preview = directionPreview(config.direction);
              return (
                <>
                  <div className="text-xs font-black uppercase tracking-wider opacity-70 mb-2">
                    Preview
                  </div>
                  <div className="text-sm font-black">
                    Prompt: <span className="font-extrabold">{preview.prompt}</span>
                  </div>
                  <div className="text-sm font-black mt-1">
                    Expected: <span className="font-extrabold">{preview.answer}</span>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs font-black uppercase tracking-wider opacity-70">Direction</div>
            <button
              type="button"
              onClick={() => setShowMoreDirections((v) => !v)}
              className="text-xs font-black text-cyan-700 dark:text-cyan-300 hover:underline"
            >
              {showMoreDirections ? 'Hide' : 'More'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DIRECTIONS.filter(
              (d) => showMoreDirections || COMMON_DIRECTIONS.includes(d.value),
            ).map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => updateConfig({ direction: d.value })}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-black transition-all ${
                  config.direction === d.value
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'
                } ${motionHover}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {step === 3 && (
        <SectionCard title="Set Challenge Level" icon={Flame}>
          <div className="space-y-5">
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-black uppercase tracking-wider">Quiz length</div>
                <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                  {config.questionCount}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={config.questionCount}
                onChange={(e) => updateConfig({ questionCount: Number(e.target.value) })}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-[10px] font-black opacity-70">
                {QUESTION_COUNT_POINTS.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40">
              <div className="text-sm font-black uppercase tracking-wider mb-3">Difficulty</div>
              <div className="flex gap-2">
                {(['easy', 'normal', 'hard'] as QuizDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateConfig({ difficulty: d })}
                    className={`flex-1 rounded-xl border-2 px-3 py-3 text-sm font-black capitalize transition-all ${
                      config.difficulty === d
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-cyan-300'
                    } ${motionHover}`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {d === 'easy' ? (
                        <Sparkles className="h-4 w-4" />
                      ) : d === 'normal' ? (
                        <Target className="h-4 w-4" />
                      ) : (
                        <Flame className="h-4 w-4" />
                      )}
                      {d}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-bold opacity-70">
              Advanced options live in the drawer—tap <span className="font-black">Advanced</span>{' '}
              in the footer.
            </div>
          </div>
        </SectionCard>
      )}

      {step === 4 && (
        <SectionCard title="Review & Start" icon={Rocket}>
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider opacity-70">
                    Scope
                  </div>
                  <div className="text-sm font-black capitalize">{scopeLabel(config.scope)}</div>
                  <div className="text-xs font-bold opacity-70 mt-1">{scopeCount} elements</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-black text-cyan-700 dark:text-cyan-300 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider opacity-70">Mode</div>
                  <div className="text-sm font-black capitalize">
                    {config.format.replace(/-/g, ' ')}
                  </div>
                  <div className="text-xs font-bold opacity-70 mt-1">
                    {DIRECTIONS.find((d) => d.value === config.direction)?.label ?? config.direction}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-black text-cyan-700 dark:text-cyan-300 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-white/60 dark:bg-gray-800/40">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-wider opacity-70">
                    Challenge
                  </div>
                  <div className="text-sm font-black">
                    {clampToScopeCount(config.questionCount, scopeCount)} questions · {config.difficulty}
                  </div>
                  <div className="text-xs font-bold opacity-70 mt-1">
                    Timer: {config.timerEnabled ? `${config.timerSeconds}s` : 'Off'} · Shuffle:{' '}
                    {config.shuffleQuestions ? 'On' : 'Off'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-sm font-black text-cyan-700 dark:text-cyan-300 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {scopeCount < 2 && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm font-black text-amber-800 dark:text-amber-200">
                Need at least 2 elements in scope to start.
              </div>
            )}
          </div>
        </SectionCard>
      )}

      <Footer />

      <Drawer.Root
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        snapPoints={[0.6, 0.9]}
        fadeFromIndex={0}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col rounded-t-[28px] bg-white dark:bg-gray-900 h-[92vh] outline-none shadow-2xl">
            <Drawer.Title className="sr-only">Advanced options</Drawer.Title>
            <Drawer.Description className="sr-only">Fine-tune quiz settings</Drawer.Description>
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />

            <div className="px-5 pb-[env(safe-area-inset-bottom)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-lg font-black uppercase tracking-wider inline-flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Advanced
                </div>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(false)}
                  className="text-sm font-black text-cyan-700 dark:text-cyan-300 hover:underline"
                >
                  Done
                </button>
              </div>

              <div className="grid gap-3 pb-6">
                <div className="card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-black uppercase tracking-wider inline-flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" /> Timer
                    </div>
                    <div className="text-xs font-bold opacity-80 mt-1">Time limit per question</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ timerEnabled: !config.timerEnabled })}
                    className={`relative h-8 w-16 shrink-0 border-2 border-[var(--color-retro-stroke)] transition-colors ${
                      config.timerEnabled ? 'bg-[var(--color-actinide)]' : 'bg-[var(--color-retro-bg)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-6 w-6 border-2 border-[var(--color-retro-stroke)] bg-white transition-transform ${
                        config.timerEnabled ? 'translate-x-8' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {config.timerEnabled && (
                  <div className="card p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="text-sm font-black uppercase tracking-wider">Timer seconds</div>
                      <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                        {config.timerSeconds}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      step={5}
                      value={config.timerSeconds}
                      onChange={(e) => updateConfig({ timerSeconds: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-black uppercase tracking-wider inline-flex items-center gap-2">
                      <Shuffle className="h-4 w-4" /> Shuffle questions
                    </div>
                    <div className="text-xs font-bold opacity-80 mt-1">Randomize the order</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ shuffleQuestions: !config.shuffleQuestions })}
                    className={`relative h-8 w-16 shrink-0 border-2 border-[var(--color-retro-stroke)] transition-colors ${
                      config.shuffleQuestions ? 'bg-[var(--color-actinide)]' : 'bg-[var(--color-retro-bg)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-6 w-6 border-2 border-[var(--color-retro-stroke)] bg-white transition-transform ${
                        config.shuffleQuestions ? 'translate-x-8' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-black uppercase tracking-wider">Shuffle options</div>
                    <div className="text-xs font-bold opacity-80 mt-1">Mix answer choices (MC)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ shuffleOptions: !config.shuffleOptions })}
                    className={`relative h-8 w-16 shrink-0 border-2 border-[var(--color-retro-stroke)] transition-colors ${
                      config.shuffleOptions ? 'bg-[var(--color-actinide)]' : 'bg-[var(--color-retro-bg)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-6 w-6 border-2 border-[var(--color-retro-stroke)] bg-white transition-transform ${
                        config.shuffleOptions ? 'translate-x-8' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {config.format === 'multiple-choice' && (
                  <div className="card p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="text-sm font-black uppercase tracking-wider">MC options</div>
                      <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                        {config.optionCount}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => updateConfig({ optionCount: n })}
                          className={`retro-btn flex-1 py-2 text-lg font-black ${
                            config.optionCount === n ? 'bg-[var(--color-actinide)]' : 'bg-white'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {config.format === 'text-input' && (
                  <div className="card p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-black uppercase tracking-wider">Strict mode</div>
                      <div className="text-xs font-bold opacity-80 mt-1">Require exact spelling</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateConfig({ strictMode: !config.strictMode })}
                      className={`relative h-8 w-16 shrink-0 border-2 border-[var(--color-retro-stroke)] transition-colors ${
                        config.strictMode ? 'bg-[var(--color-actinide)]' : 'bg-[var(--color-retro-bg)]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-6 w-6 border-2 border-[var(--color-retro-stroke)] bg-white transition-transform ${
                          config.strictMode ? 'translate-x-8' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

