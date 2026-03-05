import React from 'react';
import { ElementData } from '../types';

interface WorksheetViewProps {
  elements: ElementData[];
  title?: string;
}

const WorksheetView: React.FC<WorksheetViewProps> = ({ elements, title }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 space-y-4">
      <div className="flex items-center justify-between no-print">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title || 'Worksheet'}</h3>
        <button onClick={() => window.print()} className="px-3 py-2 rounded-md bg-cyan-600 text-white font-semibold">Print</button>
      </div>
      <div className="print-only text-center text-xl font-bold mb-4">{title || 'Periodic Table Worksheet'}</div>
      {elements.length === 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-300">No elements available for this worksheet.</div>
      )}
      <div className="grid gap-2">
        {elements.map(el => (
          <div key={el.atomicNumber} className="grid grid-cols-[120px_1fr_1fr_1fr] gap-2 items-center border-b border-gray-200 dark:border-gray-700 py-2 text-sm">
            <div className="font-semibold">{el.name}</div>
            <div className="text-gray-500 dark:text-gray-400">Symbol: ________</div>
            <div className="text-gray-500 dark:text-gray-400">Atomic #: ________</div>
            <div className="text-gray-500 dark:text-gray-400">Category: ________</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorksheetView;
