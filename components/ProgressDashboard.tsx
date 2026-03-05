import React from 'react';
import { ProgressState } from '../types';

interface ProgressDashboardProps {
  progress: ProgressState;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progress</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">Streak: {progress.streak}</div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">By Quiz Mode</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(progress.perMode).map(([mode, stats]) => (
            <div key={mode} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">{mode}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {stats.correct} / {stats.total}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">By Category</h4>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(progress.perCategory).map(([category, stats]) => (
            <div key={category} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs capitalize text-gray-500 dark:text-gray-400">{category}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {stats.correct} / {stats.total}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">By Group</h4>
          <div className="grid gap-2 grid-cols-3">
            {Object.entries(progress.perGroup).sort((a, b) => Number(a[0]) - Number(b[0])).map(([group, stats]) => (
              <div key={group} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">G{group}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{stats.correct}/{stats.total}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">By Period</h4>
          <div className="grid gap-2 grid-cols-4">
            {Object.entries(progress.perPeriod).sort((a, b) => Number(a[0]) - Number(b[0])).map(([period, stats]) => (
              <div key={period} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">P{period}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{stats.correct}/{stats.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {progress.lastPlayed && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last played: {new Date(progress.lastPlayed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
