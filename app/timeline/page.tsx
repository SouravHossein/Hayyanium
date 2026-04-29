"use client";

import React from 'react';
import { ArrowLeft, Clock3 } from 'lucide-react';
import HistoricalTimelineModal from '@/components/HistoricalTimelineModal';
import { allElementsData } from '@/data/elements';
import Link from 'next/link';

export default function TimelinePage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-28">
      <div className="mx-auto max-w-5xl">
                <header className="flex flex-col justify-between items-start  mb-8 gap-4 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Table</span>
          </Link>
          <div>

            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              <Clock3 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              <span>Discovery Timeline</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Explore how the elements were discovered across ancient history and the modern era.
            </p>
          </div>
        </header>

        <HistoricalTimelineModal elements={allElementsData} />
      </div>
    </div>
  );
}
