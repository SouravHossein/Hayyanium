'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuizSettings, saveQuizSettings, resetQuizSettings } from '@/lib/quiz/quizSettings';
import { clearQuizHistory } from '@/lib/quiz/quizStorage';
import { QuizSettings } from '@/types/quizTypes';
import { ArrowLeft, FlaskConical, Flame, Settings, Sparkles } from '@/components/icons';

export default function QuizSettingsPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setSettings(getQuizSettings());
  }, []);

  const update = (patch: Partial<QuizSettings>) => {
    const next = { ...settings!, ...patch };
    setSettings(next);
    saveQuizSettings(next);
  };

  if (!settings) return null;

  const Toggle = ({
    label,
    desc,
    value,
    onChange,
  }: {
    label: string;
    desc: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="card p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm sm:text-base font-black text-[var(--color-retro-text)] uppercase tracking-wider">
          {label}
        </div>
        <div className="text-xs text-[var(--color-retro-text)] opacity-80 font-bold mt-1">
          {desc}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-8 w-16 shrink-0 border-2 border-[var(--color-retro-stroke)] transition-colors ${
          value ? 'bg-[var(--color-actinide)]' : 'bg-[var(--color-retro-bg)]'
        }`}
      >
        <div
          className={`absolute top-0.5 h-6 w-6 border-2 border-[var(--color-retro-stroke)] bg-white transition-transform ${
            value ? 'translate-x-8' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <Link href="/quiz" className="inline-flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Quiz</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">Quiz Settings</h1>
      </header>

      <section className="card p-6 sm:p-8">
        <p className="text-sm font-bold opacity-80">
          Configure how the quiz behaves by default. Changes save instantly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-[var(--color-retro-text)] uppercase tracking-wider inline-flex items-center gap-2"><Settings className="h-5 w-5" /> Audio & Feedback</h2>
        <div className="grid gap-3">
          <Toggle
            label="Sound Effects"
            desc="Play sounds for correct and wrong answers"
            value={settings.soundEnabled}
            onChange={(v) => update({ soundEnabled: v })}
          />
          <Toggle
            label="Vibration"
            desc="Haptic feedback on supported devices"
            value={settings.vibrationEnabled}
            onChange={(v) => update({ vibrationEnabled: v })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-[var(--color-retro-text)] uppercase tracking-wider inline-flex items-center gap-2"><FlaskConical className="h-5 w-5" /> Defaults</h2>
        <div className="grid gap-3">
          <Toggle
            label="Timer"
            desc="Enable a default timer for new quizzes"
            value={settings.timerEnabled}
            onChange={(v) => update({ timerEnabled: v })}
          />
          <div className="card p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-sm sm:text-base font-black uppercase tracking-wider">Timer Duration</div>
              <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                {settings.defaultTimerSeconds}s
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={settings.defaultTimerSeconds}
              onChange={(e) => update({ defaultTimerSeconds: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-sm sm:text-base font-black uppercase tracking-wider">Question Count</div>
              <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                {settings.defaultQuestionCount}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.defaultQuestionCount}
              onChange={(e) => update({ defaultQuestionCount: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-sm sm:text-base font-black uppercase tracking-wider">MC Options</div>
              <span className="text-sm font-black bg-[var(--color-alkaline-earth-metal)] text-[var(--color-retro-text)] px-3 py-1 rounded-full border-2 border-[var(--color-retro-stroke)]">
                {settings.defaultOptionCount}
              </span>
            </div>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => update({ defaultOptionCount: n })}
                  className={`retro-btn flex-1 py-2 text-lg font-black ${
                    settings.defaultOptionCount === n ? 'bg-[var(--color-actinide)]' : 'bg-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-[var(--color-retro-text)] uppercase tracking-wider inline-flex items-center gap-2"><Sparkles className="h-5 w-5" /> Answer Checking</h2>
        <div className="grid gap-3">
          <Toggle
            label="Strict Mode"
            desc="Require exact spelling instead of aliases"
            value={settings.strictAnswerChecking}
            onChange={(v) => update({ strictAnswerChecking: v })}
          />
          <Toggle
            label="Show Decimals"
            desc="Show full atomic weight decimals"
            value={settings.showAtomicWeightDecimals}
            onChange={(v) => update({ showAtomicWeightDecimals: v })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-[var(--color-retro-text)] uppercase tracking-wider inline-flex items-center gap-2"><Flame className="h-5 w-5" /> Accessibility</h2>
        <Toggle
          label="Reduced Motion"
          desc="Minimize animations and motion effects"
          value={settings.reducedMotion}
          onChange={(v) => update({ reducedMotion: v })}
        />
        <div className="card p-4">
          <div className="text-sm sm:text-base font-black uppercase tracking-wider mb-3">Font Size</div>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((s) => (
              <button
                key={s}
                onClick={() => update({ fontSize: s })}
                className={`retro-btn flex-1 py-2 text-lg font-black capitalize ${
                  settings.fontSize === s ? 'bg-[var(--color-actinide)]' : 'bg-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3 pt-4 border-t-4 border-[var(--color-retro-stroke)]">
        <h2 className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-wider inline-flex items-center gap-2"><Flame className="h-5 w-5" /> Danger Zone</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetQuizSettings();
              setSettings(getQuizSettings());
            }}
            className="retro-btn px-4 py-2.5 text-sm font-black text-[var(--color-retro-text)] bg-white"
          >
            Reset Settings
          </button>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="retro-btn px-4 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600"
            >
              Clear All History
            </button>
          ) : (
            <div className="card p-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                Are you sure?
              </span>
              <button
                onClick={() => {
                  clearQuizHistory();
                  setShowConfirm(false);
                }}
                className="retro-btn px-3 py-1.5 text-sm font-black text-white bg-red-500"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="retro-btn px-3 py-1.5 text-sm font-black text-[var(--color-retro-text)] bg-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
