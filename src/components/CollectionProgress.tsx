import React from 'react';
import { Trophy } from '@/components/icons';

interface CollectionProgressProps {
  total: number;
  count: number;
}

const CollectionProgress: React.FC<CollectionProgressProps> = ({ total, count }) => {
  const percentage = Math.round((count / total) * 100);

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Discovery Progress</h4>
          <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{count}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400"> / {total}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{percentage}%</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {count === total && (
        <div className="mt-2 text-[10px] font-bold text-green-500 flex items-center gap-1 animate-bounce">
          <Trophy className="h-4 w-4" /> MASTER CHEMIST UNLOCKED
        </div>
      )}
    </div>
  );
};

export default CollectionProgress;
