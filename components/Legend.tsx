
import React from 'react';
import { CATEGORY_COLORS } from '../constants';
import { ElementCategory } from '../types/index';

const Legend = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800 my-4">
      <h3 className="text-lg font-bold mb-2 text-cyan-300">Legend</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
        {Object.entries(CATEGORY_COLORS).map(([category, colorClass]) => (
          <div key={category} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-sm ${colorClass}`}></div>
            <span className="capitalize">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
