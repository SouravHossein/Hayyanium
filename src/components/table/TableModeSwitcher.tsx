import React from 'react';
import { TableMode, ALL_MODES, LAYOUT_META } from '../../layouts';
import { useDragToScroll } from '../../hooks/useDragToScroll';

interface TableModeSwitcherProps {
  currentMode: TableMode;
  onModeChange: (mode: TableMode) => void;
}

const TableModeSwitcher: React.FC<TableModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  const scrollRef = useDragToScroll<HTMLDivElement>();

  return (
    <div className="w-full">
      {/* Scrollable pill bar */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1 snap-x snap-mandatory hide-scrollbar"
      >
        {ALL_MODES.map((mode) => {
          const meta = LAYOUT_META[mode];
          const isActive = currentMode === mode;

          return (
            <button
              key={mode}
              id={`mode-${mode}`}
              onClick={() => onModeChange(mode)}
              className={`snap-start shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border whitespace-nowrap ${isActive
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-[1.02]'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-cyan-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10'
                }`}
              title={meta.description}
            >
              <span className="text-sm">{meta.icon}</span>
              <span>{meta.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableModeSwitcher;
