'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, ChartColumn, FlaskConical, House, Settings, Sparkles } from '@/components/icons';

const NAV_ITEMS = [
  // { href: '/quiz', label: 'Game', icon: House },
  { href: '/quiz/setup', label: 'Quiz', icon: FlaskConical },
  { href: '/quiz/history', label: 'History', icon: ChartColumn },
  { href: '/quiz/settings', label: 'Settings', icon: Settings },
  { href: '/', label: 'Study', icon: BookOpenText },
];

export default function QuizNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-1">
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/quiz' ? pathname === '/quiz' : item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav - rendered within layout */}
    </>
  );
}

export function QuizSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col gap-1 w-56 shrink-0 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 h-fit sticky top-24">
      <div className="mb-3">
        <Link href="/quiz/setup" className="text-lg font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-500">
          Hayyanium Quiz
        </Link>
      </div>
      {NAV_ITEMS.map(item => {
        const isActive = item.href === '/quiz' ? pathname === '/quiz' : item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700/50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:text-gray-900 dark:hover:text-gray-200'}`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {/* <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/quiz/premium" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 hover:scale-[1.02] transition-all">
          <Sparkles className="h-4 w-4" /><span>Premium</span>
        </Link>
      </div> */}
    </nav>
  );
}
