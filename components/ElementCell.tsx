import React from 'react';
import { ElementData } from '../types/index';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../constants';

interface ElementCellProps {
  element: ElementData;
  isSelected: boolean;
  isFavorite: boolean;
  isFocused?: boolean;
  onSelect: (element: ElementData) => void;
  onHover: (element: ElementData | null) => void;
  trendStyle?: React.CSSProperties;
  isDraggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>, element: ElementData) => void;
  onDragEnd?: (event: React.DragEvent<HTMLButtonElement>) => void;
  onFocusElement?: (element: ElementData) => void;
  isHighlighted?: boolean;
}

const ElementCell: React.FC<ElementCellProps> = ({ 
  element, 
  isSelected, 
  isFavorite, 
  isFocused,
  onSelect, 
  onHover, 
  trendStyle,
  isDraggable,
  onDragStart,
  onDragEnd,
  onFocusElement,
  isHighlighted
}) => {
  const colorClass = trendStyle ? '' : CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = trendStyle ? '' : CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  
  const atomicMass = typeof element.atomicMass === 'string' 
    ? element.atomicMass 
    : element.atomicMass.toFixed(3);

  const blockColor = 
    element.block ==="s" ? 'bg-green-400' :
    element.block ==="p"?  'bg-blue-400' :
    element.block ==="d" ? 'bg-yellow-400' :
    element.block ==="f" ? 'bg-pink-400':
    "bg-green-400"

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (onDragStart) {
      onDragStart(e, element);
    }
  };

  return (
    <button
      onClick={() => onSelect(element)}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => {
        onHover(element);
        if (onFocusElement) onFocusElement(element);
      }}
      onBlur={() => onHover(null)}
      aria-label={element.name}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      className={`relative p-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 hover:z-10 focus:scale-110 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-300 ${colorClass} ${textColorClass} ${isSelected ? 'ring-4 ring-cyan-500 dark:ring-cyan-300 scale-110 z-10' : ''} ${isFocused ? 'ring-2 ring-amber-400 dark:ring-amber-300' : ''} ${isDraggable ? 'cursor-grab' : ''} ${isHighlighted ? 'shadow-[0_0_15px_3px_rgba(56,189,248,0.7)] z-20' : ''}`}
      style={{ 
        gridColumnStart: element.xpos, 
        gridRowStart: element.ypos,
        ...(trendStyle || {}) 
      }}
    >
      <div className="absolute top-0.5 left-1 text-xs font-medium">{element.atomicNumber}</div>

      {isFavorite && (
        <div className="absolute top-0.5 right-1 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {!trendStyle && <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-sm ${blockColor}`} ></div>}

      <div className="text-2xl font-bold leading-tight mt-1">{element.symbol}</div>
      <div className="text-xs truncate">{element.name}</div>
      <div className="text-xs">{atomicMass}</div>
    </button>
  );
};

export default ElementCell;
