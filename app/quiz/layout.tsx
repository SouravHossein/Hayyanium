import type { Metadata } from 'next';
import { QuizProvider } from '@/contexts/QuizContext';
import QuizNav, { QuizSidebar } from '@/components/quiz/QuizNav';

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Test your knowledge of the periodic table with interactive quizzes. Multiple choice, text input, and find-on-table modes.',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuizProvider>
      <div className="min-h-screen pb-20 md:pb-8">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <a href="/quiz" className="text-lg font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-500">
              Hayyanium Quiz
            </a>
            <a href="/" className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Back to Table</span>
            </a>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <QuizSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

        <QuizNav />
      </div>
    </QuizProvider>
  );
}
