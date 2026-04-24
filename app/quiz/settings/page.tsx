'use client';

import React, { useState, useEffect } from 'react';
import { getQuizSettings, saveQuizSettings, resetQuizSettings } from '@/lib/quiz/quizSettings';
import { clearQuizHistory } from '@/lib/quiz/quizStorage';
import { QuizSettings } from '@/types/quizTypes';

export default function QuizSettingsPage() {
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { setSettings(getQuizSettings()); }, []);

  const update = (patch: Partial<QuizSettings>) => {
    const next = { ...settings!, ...patch };
    setSettings(next);
    saveQuizSettings(next);
  };

  if (!settings) return null;

  const Toggle = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div><div className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</div><div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div></div>
      <button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Quiz Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your quiz experience</p>
      </div>

      {/* Audio & Feedback */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Audio & Feedback</h2>
        <div className="grid gap-3">
          <Toggle label="🔊 Sound Effects" desc="Play sounds for correct/wrong answers" value={settings.soundEnabled} onChange={v => update({ soundEnabled: v })} />
          <Toggle label="📳 Vibration" desc="Haptic feedback on mobile" value={settings.vibrationEnabled} onChange={v => update({ vibrationEnabled: v })} />
        </div>
      </section>

      {/* Defaults */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Defaults</h2>
        <div className="grid gap-3">
          <Toggle label="⏱️ Timer" desc="Enable timer by default" value={settings.timerEnabled} onChange={v => update({ timerEnabled: v })} />
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Timer Duration</div>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{settings.defaultTimerSeconds}s</span>
            </div>
            <input type="range" min={5} max={120} step={5} value={settings.defaultTimerSeconds} onChange={e => update({ defaultTimerSeconds: Number(e.target.value) })} className="w-full accent-cyan-500" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Question Count</div>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{settings.defaultQuestionCount}</span>
            </div>
            <input type="range" min={5} max={50} step={5} value={settings.defaultQuestionCount} onChange={e => update({ defaultQuestionCount: Number(e.target.value) })} className="w-full accent-cyan-500" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">MC Options</div>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{settings.defaultOptionCount}</span>
            </div>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => update({ defaultOptionCount: n })}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${settings.defaultOptionCount === n ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Answer Checking */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Answer Checking</h2>
        <Toggle label="🔒 Strict Mode" desc="Require exact spelling (no aliases)" value={settings.strictAnswerChecking} onChange={v => update({ strictAnswerChecking: v })} />
        <Toggle label="🔢 Show Decimals" desc="Show full atomic weight decimals" value={settings.showAtomicWeightDecimals} onChange={v => update({ showAtomicWeightDecimals: v })} />
      </section>

      {/* Accessibility */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Accessibility</h2>
        <Toggle label="🐢 Reduced Motion" desc="Minimize animations" value={settings.reducedMotion} onChange={v => update({ reducedMotion: v })} />
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Font Size</div>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map(s => (
              <button key={s} onClick={() => update({ fontSize: s })}
                className={`flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-all ${settings.fontSize === s ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Danger Zone</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { resetQuizSettings(); setSettings(getQuizSettings()); }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
            Reset Settings
          </button>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              className="rounded-xl border-2 border-red-300 dark:border-red-700 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              Clear All History
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 dark:text-red-400 font-semibold">Are you sure?</span>
              <button onClick={() => { clearQuizHistory(); setShowConfirm(false); }}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">Yes, delete</button>
              <button onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
