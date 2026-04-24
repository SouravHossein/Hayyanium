'use client';

import React from 'react';
import Link from 'next/link';

const FREE_FEATURES = ['Multiple Choice mode', '10 questions per quiz', 'Basic progress tracking', 'Light & dark themes', '3 quiz directions'];
const PREMIUM_FEATURES = ['All 3 quiz modes', 'Unlimited questions', 'Advanced mastery tracking', 'Custom themes & accents', 'All 6 quiz directions', 'Element explanations', 'No advertisements', 'Export/import progress', 'Challenge mode', 'Daily streaks'];

export default function QuizPremiumPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Hayyanium Premium</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Unlock the full periodic table learning experience</p>
      </div>

      {/* Comparison */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="text-center mb-4">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Free</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">$0</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">forever</div>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-emerald-500">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium */}
        <div className="rounded-2xl border-2 border-cyan-500 bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-900/20 dark:to-gray-800 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">RECOMMENDED</div>
          <div className="text-center mb-4">
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Premium</div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">$4.99</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">one-time purchase</div>
          </div>
          <ul className="space-y-2">
            {PREMIUM_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-cyan-500">✓</span>{f}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all active:scale-[0.98]">
            Upgrade to Premium
          </button>
        </div>
      </div>

      <div className="text-center">
        <Link href="/quiz" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">← Back to Quiz</Link>
      </div>
    </div>
  );
}
