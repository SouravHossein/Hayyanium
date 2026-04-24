'use client';

import React, { useMemo } from 'react';
import { allElementsData } from '../../data/elements';
import { getPerElementMastery } from '../../lib/quiz/quizStorage';
import { CATEGORY_HEX_COLORS } from '../../constants';

export default function ElementMasteryGrid() {
  const mastery = useMemo(() => {
    if (typeof window === 'undefined') return {};
    return getPerElementMastery();
  }, []);

  const getColor = (atomicNumber: number) => {
    const m = mastery[atomicNumber];
    if (!m || m.status === 'untested') return '#374151'; // gray-700
    if (m.status === 'mastered') return '#10b981'; // emerald-500
    if (m.status === 'learning') return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const stats = useMemo(() => {
    const vals = Object.values(mastery);
    return {
      mastered: vals.filter(m => m.status === 'mastered').length,
      learning: vals.filter(m => m.status === 'learning').length,
      weak: vals.filter(m => m.status === 'weak').length,
      untested: 118 - vals.length,
    };
  }, [mastery]);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {[
          { label: `Mastered (${stats.mastered})`, color: '#10b981' },
          { label: `Learning (${stats.learning})`, color: '#f59e0b' },
          { label: `Weak (${stats.weak})`, color: '#ef4444' },
          { label: `Untested (${stats.untested})`, color: '#374151' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Mini periodic table grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', minWidth: '500px' }}>
          {allElementsData.map(el => {
            const m = mastery[el.atomicNumber];
            const color = getColor(el.atomicNumber);
            const accuracy = m ? Math.round(m.accuracy) : null;

            return (
              <div
                key={el.atomicNumber}
                className="relative flex flex-col items-center justify-center rounded-sm transition-all hover:scale-125 hover:z-10 cursor-default group"
                style={{
                  gridRow: el.ypos,
                  gridColumn: el.xpos,
                  backgroundColor: color,
                  minWidth: '22px',
                  minHeight: '22px',
                  opacity: m ? 1 : 0.35,
                }}
                title={`${el.name} (${el.symbol}) — ${m ? `${accuracy}% accuracy, ${m.totalAttempts} attempts` : 'Not yet tested'}`}
              >
                <span className="text-[7px] font-bold text-white leading-none">{el.symbol}</span>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 pointer-events-none">
                  <div className="rounded-md bg-gray-900 dark:bg-gray-700 px-2 py-1 text-[9px] text-white whitespace-nowrap shadow-lg">
                    <div className="font-bold">{el.name}</div>
                    {m ? <div>{accuracy}% · {m.totalAttempts} tries</div> : <div>Untested</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
