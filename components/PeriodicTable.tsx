
import React from 'react';
import { ElementData } from '../types/index';
import ElementCell from './ElementCell';

interface PeriodicTableProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  favorites: number[];
  onSelectElement: (element: ElementData) => void;
  onHoverElement: (element: ElementData | null) => void;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ elements, selectedElement, favorites, onSelectElement, onHoverElement }) => {
  return (
    <div className="w-full overflow-x-auto p-4">
        <div className="grid gap-1" style={{gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gridTemplateRows: 'repeat(9, minmax(0, 1fr))'}}>
        {elements.map(element => (
            <ElementCell
            key={element.atomicNumber}
            element={element}
            isSelected={selectedElement?.atomicNumber === element.atomicNumber}
            isFavorite={favorites.includes(element.atomicNumber)}
            onSelect={onSelectElement}
            onHover={onHoverElement}
            />
        ))}
        </div>
    </div>
  );
};

export default PeriodicTable;
