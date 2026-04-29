"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock3 } from 'lucide-react';
import HistoricalTimelineModal from '@/components/HistoricalTimelineModal';
import { allElementsData } from '@/data/elements';

export default function TimelinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Table</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 px-4 py-2 text-sm font-semibold">
            <Clock3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>Discovery Timeline</span>
          </div>
        </header>

        <HistoricalTimelineModal elements={allElementsData} onClose={() => router.push('/')} />
      </div>
    </div>
  );
}
