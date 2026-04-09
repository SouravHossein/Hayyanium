import React from 'react';
import { ElementData } from '../types/index';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ElementListProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  favorites: number[];
  onSelectElement: (element: ElementData) => void;
}

const ElementList: React.FC<ElementListProps> = ({ elements, selectedElement, favorites, onSelectElement }) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="max-h-[60vh] overflow-y-auto">
        {elements.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No elements found matching your criteria.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {elements.map((element) => {
              const isSelected = selectedElement?.atomicNumber === element.atomicNumber;
              const isFavorite = favorites.includes(element.atomicNumber);
              const colorClass = CATEGORY_COLORS[element.category] || 'bg-gray-700';
              const textColorClass = CATEGORY_TEXT_COLORS[element.category] || 'text-white';

              return (
                <li key={element.atomicNumber}>
                  <button
                    onClick={() => onSelectElement(element)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${colorClass} ${textColorClass} shadow-sm`}>
                        {element.symbol}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 dark:text-white">{element.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({element.atomicNumber})</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                          {element.category} • {element.atomicMass} u
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isFavorite && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ElementList;
