import React from 'react';
import { ElementData } from '../types/index';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ElementCellProps {
  element: ElementData;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (element: ElementData) => void;
  onHover: (element: ElementData | null) => void;
}

const ElementCell: React.FC<ElementCellProps> = ({ element, isSelected, isFavorite, onSelect, onHover }) => {
  const colorClass = CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  
  const atomicMass = typeof element.atomicMass === 'string' 
    ? element.atomicMass 
    : element.atomicMass.toFixed(3);

  // 🎨 Block color based on atomic number range
  const blockColor = 
    element.atomicNumber <= 20 ? 'bg-green-400' :
    element.atomicNumber <= 40 ? 'bg-blue-400' :
    element.atomicNumber <= 60 ? 'bg-yellow-400' :
    element.atomicNumber <= 80 ? 'bg-pink-400' :
    'bg-purple-500';

let blockName: string;

if (element.xpos >= 1 && element.xpos <= 2) {
  blockName = 's';
} else if (element.xpos >= 13 && element.xpos <= 18) {
  blockName = 'p';
} else if (element.xpos >= 3 && element.xpos <= 12 && element.ypos <= 7) {
  blockName = 'd';
} else if (element.ypos > 7) {
  blockName = 'f';
} else {
  blockName = '?'; // fallback, rare
}
  return (
    <button
      onClick={() => onSelect(element)}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(element)}
      onBlur={() => onHover(null)}
      aria-label={element.name}
      className={`relative p-1 rounded-md transition-transform duration-200 ease-in-out transform hover:scale-110 hover:z-10 focus:scale-110 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-300 ${colorClass} ${textColorClass} ${isSelected ? 'ring-4 ring-cyan-500 dark:ring-cyan-300 scale-110 z-10' : ''}`}
      style={{ gridColumnStart: element.xpos, gridRowStart: element.ypos }}
    >
      <div className="absolute top-0.5 left-1 text-xs font-medium">{element.atomicNumber}</div>

      {/* ⭐ Favorite Star */}
      {isFavorite && (
        <div className="absolute top-0.5 right-1 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* 🟩 Block mark */}
      <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-sm ${blockColor}`} >{blockName}</div>

      <div className="text-2xl font-bold leading-tight mt-1">{element.symbol}</div>
      <div className="text-xs truncate">{element.name}</div>
      <div className="text-xs">{atomicMass}</div>
    </button>
  );
};

export default ElementCell;
