import React, { useMemo, useState } from 'react';
import { ElementData } from '../types/index';
import ElementCell from './ElementCell';
import { Trend } from '../types';

interface PeriodicTableProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  favorites: number[];
  onSelectElement: (element: ElementData) => void;
  onHoverElement: (element: ElementData | null) => void;
  selectedTrend: Trend | null;
  isDraggable?: boolean;
  onElementDragStart?: (event: React.DragEvent<HTMLAnchorElement>, element: ElementData) => void;
  onElementDragEnd?: (event: React.DragEvent<HTMLAnchorElement>) => void;
  onGroupClick: (group: number) => void;
  onPeriodClick: (period: number) => void;
  onElementTouchStart?: (element: ElementData, e: React.TouchEvent) => void;
  onElementTouchMove?: (e: React.TouchEvent) => void;
  onElementTouchEnd?: (e: React.TouchEvent) => void;
}

const GROUP_LABELS: { [key: number]: string } = {
  1: 'IA', 2: 'IIA', 3: 'IIIB', 4: 'IVB', 5: 'VB', 6: 'VIB', 7: 'VIIB',
  8: 'VIIIB', 9: 'VIIIB', 10: 'VIIIB', 11: 'IB', 12: 'IIB', 13: 'IIIA',
  14: 'IVA', 15: 'VA', 16: 'VIA', 17: 'VIIA', 18: 'VIIIA'
};

const PeriodicTable: React.FC<PeriodicTableProps> = ({ 
  elements, 
  selectedElement, 
  favorites, 
  onSelectElement, 
  onHoverElement, 
  selectedTrend,
  isDraggable,
  onElementDragStart,
  onElementDragEnd,
  onGroupClick,
  onPeriodClick,
  onElementTouchStart,
  onElementTouchMove,
  onElementTouchEnd,
}) => {
    const [hoveredGroup, setHoveredGroup] = useState<number | null>(null);
    const [hoveredPeriod, setHoveredPeriod] = useState<number | null>(null);

    const elementStyles = useMemo(() => {
    if (!selectedTrend) return {};

    const values = elements
      .map(el => el[selectedTrend])
      .filter((v): v is number => v !== null && typeof v === 'number');
      
    if (values.length === 0) return {};
    
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;

    // Gradient: light blue (low) -> white -> light red (high)
    // HSL: (200, 90%, 80%) -> (200, 20%, 95%) -> (0, 90%, 80%)
    const getColorForValue = (value: number) => {
        if (range === 0) return `hsl(200, 90%, 80%)`;
        // Invert for atomic radius, as larger is "less" in terms of trend strength from left to right
        const rawT = (value - minVal) / range;
        const t = selectedTrend === 'atomicRadius_pm' ? 1 - rawT : rawT;

        let h, s, l;
        if (t < 0.5) { // Blue to White
            const t2 = t * 2;
            h = 200;
            s = 90 * (1 - t2) + 20 * t2;
            l = 80 * (1 - t2) + 95 * t2;
        } else { // White to Red
            const t2 = (t - 0.5) * 2;
            h = 200 * (1 - t2) + 0 * t2;
            s = 20 * (1 - t2) + 90 * t2;
            l = 95 * (1 - t2) + 80 * t2;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    };
    
    const styles: { [atomicNumber: number]: React.CSSProperties } = {};
    elements.forEach(el => {
      const value = el[selectedTrend];
      if (value !== null && typeof value === 'number') {
        const backgroundColor = getColorForValue(value);
        // Text color based on lightness, simple threshold
        const lightness = parseFloat(backgroundColor.split(',')[2]);
        styles[el.atomicNumber] = {
          backgroundColor,
          color: lightness > 75 ? '#111827' : '#FFFFFF', // dark text on light bg
        };
      } else {
        styles[el.atomicNumber] = {
          backgroundColor: '#e5e7eb', // bg-gray-200
          color: '#6b7280' // text-gray-500
        };
      }
    });
    return styles;

  }, [elements, selectedTrend]);


  return (
    <div 
      className="w-full overflow-auto p-4 overscroll-contain touch-pan-x touch-pan-y hide-scrollbar scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
        <div className="grid gap-1 min-w-[1000px] lg:min-w-0" style={{gridTemplateColumns: 'auto repeat(18, minmax(0, 1fr))', gridTemplateRows: 'auto repeat(9, minmax(0, 1fr))'}}>
        {/* Group Labels */}
        {Array.from({ length: 18 }, (_, i) => i + 1).map(groupNumber => (
            <button key={`group-${groupNumber}`} 
                 className="text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col justify-end pb-1 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                 style={{ gridColumnStart: groupNumber + 1, gridRowStart: 1 }}
                 onMouseEnter={() => setHoveredGroup(groupNumber)}
                 onMouseLeave={() => setHoveredGroup(null)}
                 onClick={() => onGroupClick(groupNumber)}
                 aria-label={`Plot trends for group ${groupNumber}`}
            >
                <div className="font-bold">{groupNumber}</div>
                <div className="font-mono text-[10px]">{GROUP_LABELS[groupNumber]}</div>
            </button>
        ))}
        
        {/* Period Labels */}
        {Array.from({ length: 7 }, (_, i) => i + 1).map(periodNumber => (
            <button key={`period-${periodNumber}`}
                 className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end pr-2 cursor-pointer rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                 style={{ gridRowStart: periodNumber + 1, gridColumnStart: 1 }}
                 onMouseEnter={() => setHoveredPeriod(periodNumber)}
                 onMouseLeave={() => setHoveredPeriod(null)}
                 onClick={() => onPeriodClick(periodNumber)}
                 aria-label={`Plot trends for period ${periodNumber}`}
            >
                <div className="font-bold">{periodNumber}</div>
            </button>
        ))}

        {elements.map(element => {
            const isLanthanideOrActinide = element.category === 'lanthanide' || element.category === 'actinide';
            const isHighlighted = 
                (hoveredGroup !== null && (element.group === hoveredGroup || (hoveredGroup === 3 && isLanthanideOrActinide))) ||
                (hoveredPeriod !== null && element.period === hoveredPeriod);

            return (
                <ElementCell
                    key={element.atomicNumber}
                    element={{...element, xpos: element.xpos + 1, ypos: element.ypos + 1}} // Offset for labels
                    isSelected={selectedElement?.atomicNumber === element.atomicNumber}
                    isFavorite={favorites.includes(element.atomicNumber)}
                    onSelect={onSelectElement}
                    onHover={onHoverElement}
                    trendStyle={elementStyles[element.atomicNumber]}
                    isDraggable={isDraggable}
                    onDragStart={onElementDragStart}
                    onDragEnd={onElementDragEnd}
                    isHighlighted={isHighlighted}
                    onTouchStart={onElementTouchStart ? (e) => onElementTouchStart(element, e) : undefined}
                    onTouchMove={onElementTouchMove}
                    onTouchEnd={onElementTouchEnd}
                />
            );
        })}
        </div>
    </div>
  );
};

export default PeriodicTable;