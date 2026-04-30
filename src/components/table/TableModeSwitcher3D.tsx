import React from 'react';
import { Table3DMode, ALL_3D_MODES, LAYOUT_3D_META } from '../../layouts/3d/types';
import { useDragToScroll } from '../../hooks/useDragToScroll';

interface TableModeSwitcher3DProps {
  currentMode: Table3DMode;
  onModeChange: (mode: Table3DMode) => void;
}

const TableModeSwitcher3D: React.FC<TableModeSwitcher3DProps> = ({ currentMode, onModeChange }) => {
  const scrollRef = useDragToScroll<HTMLDivElement>();

  return (
    <div className="w-full">
      {/* Scrollable pill bar */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar snap-x snap-mandatory"
      >
        {ALL_3D_MODES.map((mode) => {
          const meta = LAYOUT_3D_META[mode];
          const isActive = currentMode === mode;

          return (
            <button
              key={mode}
              id={`mode-${mode}`}
              onClick={() => onModeChange(mode)}
              className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${isActive
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] scale-[1.02]'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                }`}
              title={meta.description}
            >
              <span className="text-sm">{meta.icon}</span>
              <span className="text-sm">{meta.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableModeSwitcher3D;
