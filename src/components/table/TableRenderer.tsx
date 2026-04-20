import React, { useMemo } from 'react';
import { ElementData, Trend } from '../../types';
import { TableMode, LAYOUT_META } from '../../layouts';
import { getLayoutEngine } from '../../layouts';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS, CATEGORY_HEX_COLORS } from '../../constants';
import Link from 'next/link';

interface TableRendererProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  favorites: number[];
  onSelectElement: (element: ElementData) => void;
  onHoverElement: (element: ElementData | null) => void;
  selectedTrend: Trend | null;
  tableMode: TableMode;
  isDraggable?: boolean;
  onElementDragStart?: (event: React.DragEvent<HTMLAnchorElement>, element: ElementData) => void;
  onElementDragEnd?: (event: React.DragEvent<HTMLAnchorElement>) => void;
  onElementTouchStart?: (element: ElementData, e: React.TouchEvent) => void;
  onElementTouchMove?: (e: React.TouchEvent) => void;
  onElementTouchEnd?: (e: React.TouchEvent) => void;
}

// ─── Trend Color Engine (shared across all modes) ──────────────────────
function useTrendStyles(elements: ElementData[], selectedTrend: Trend | null) {
  return useMemo(() => {
    if (!selectedTrend) return {};

    const values = elements
      .map((el) => el[selectedTrend])
      .filter((v): v is number => v !== null && typeof v === 'number');

    if (values.length === 0) return {};

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;

    const getColor = (value: number) => {
      if (range === 0) return `hsl(200, 90%, 80%)`;
      const rawT = (value - minVal) / range;
      const t = selectedTrend === 'atomicRadius_pm' ? 1 - rawT : rawT;
      let h, s, l;
      if (t < 0.5) {
        const t2 = t * 2;
        h = 200; s = 90 * (1 - t2) + 20 * t2; l = 80 * (1 - t2) + 95 * t2;
      } else {
        const t2 = (t - 0.5) * 2;
        h = 200 * (1 - t2); s = 20 * (1 - t2) + 90 * t2; l = 95 * (1 - t2) + 80 * t2;
      }
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const styles: Record<number, React.CSSProperties> = {};
    elements.forEach((el) => {
      const value = el[selectedTrend];
      if (value !== null && typeof value === 'number') {
        const bg = getColor(value);
        const lightness = parseFloat(bg.split(',')[2]);
        styles[el.atomicNumber] = { backgroundColor: bg, color: lightness > 75 ? '#111827' : '#FFF' };
      } else {
        styles[el.atomicNumber] = { backgroundColor: '#e5e7eb', color: '#6b7280' };
      }
    });

    return styles;
  }, [elements, selectedTrend]);
}

// ─── Reusable Mini-Cell ────────────────────────────────────────────────
interface MiniCellProps {
  element: ElementData;
  isSelected: boolean;
  isFavorite: boolean;
  trendStyle?: React.CSSProperties;
  style: React.CSSProperties;
  onSelect: (el: ElementData) => void;
  onHover: (el: ElementData | null) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLAnchorElement>, el: ElementData) => void;
  onDragEnd?: (e: React.DragEvent<HTMLAnchorElement>) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  compact?: boolean;
}

const MiniCell: React.FC<MiniCellProps> = ({
  element, isSelected, isFavorite, trendStyle, style,
  onSelect, onHover, isDraggable, onDragStart, onDragEnd,
  onTouchStart, onTouchMove, onTouchEnd, compact,
}) => {
  const colorClass = trendStyle ? '' : CATEGORY_COLORS[element.category] || 'bg-gray-700';
  const textColorClass = trendStyle ? '' : CATEGORY_TEXT_COLORS[element.category] || 'text-white';
  const blockColor =
    element.block === 's' ? 'bg-green-400' :
    element.block === 'p' ? 'bg-blue-400' :
    element.block === 'd' ? 'bg-yellow-400' :
    element.block === 'f' ? 'bg-pink-400' : 'bg-green-400';

  const handleClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      onSelect(element);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLAnchorElement>) => {
    if (onDragStart) onDragStart(e, element);
  };

  return (
    <Link
      href={`/element/${element.symbol}`}
      onClick={handleClick}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      aria-label={element.name}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDrag : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`relative rounded-md transition-all duration-300 transform hover:scale-110 hover:z-20 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorClass} ${textColorClass} ${
        isSelected ? 'ring-2 ring-cyan-400 scale-110 z-20' : ''
      } ${isDraggable ? 'cursor-grab' : ''}`}
      style={{
        ...style,
        ...(trendStyle || {}),
        overflow: 'hidden',
      }}
    >
      {/* Content */}
      <div className={`flex flex-col items-center justify-center h-full w-full ${compact ? 'p-0.5' : 'p-1'}`}>
        <span className={`absolute top-0 left-0.5 ${compact ? 'text-[7px]' : 'text-[9px]'} font-medium opacity-70`}>
          {element.atomicNumber}
        </span>
        {!trendStyle && (
          <span className={`absolute top-0 right-0.5 w-1.5 h-1.5 rounded-sm ${blockColor}`} />
        )}
        {isFavorite && (
          <span className="absolute top-0 right-0.5 text-[8px] text-yellow-300">★</span>
        )}
        <span className={`${compact ? 'text-sm' : 'text-lg sm:text-xl'} font-bold leading-none`}>
          {element.symbol}
        </span>
        {!compact && (
          <span className="text-[8px] sm:text-[10px] truncate max-w-full leading-none mt-0.5">
            {element.name}
          </span>
        )}
      </div>
    </Link>
  );
};

// ─── GRID Renderer ─────────────────────────────────────────────────────
const GridRenderer: React.FC<TableRendererProps & { themeClass?: string }> = (props) => {
  const {
    elements, selectedElement, favorites, onSelectElement, onHoverElement,
    selectedTrend, tableMode, isDraggable, onElementDragStart, onElementDragEnd,
    onElementTouchStart, onElementTouchMove, onElementTouchEnd, themeClass,
  } = props;

  const engine = getLayoutEngine(tableMode);
  const layout = useMemo(() => engine(elements), [engine, elements]);
  const trendStyles = useTrendStyles(elements, selectedTrend);

  const gridTemplate = {
    gridTemplateColumns: `repeat(${layout.gridCols || 20}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${layout.gridRows || 11}, minmax(0, 1fr))`,
  };

  return (
    <div
      className={`w-full overflow-auto p-3 overscroll-contain touch-pan-x touch-pan-y hide-scrollbar scroll-smooth ${themeClass || ''}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        className="grid gap-0.5 min-w-[700px] lg:min-w-0"
        style={gridTemplate}
      >
        {/* Labels */}
        {layout.labels?.map((label, i) => (
          <div
            key={`label-${i}`}
            className={`flex items-center justify-center text-[10px] font-bold ${
              label.type === 'block'
                ? 'text-cyan-500 dark:text-cyan-400 text-[9px] uppercase tracking-wider'
                : 'text-gray-400 dark:text-gray-500'
            }`}
            style={{ gridColumnStart: label.x, gridRowStart: label.y }}
          >
            {label.text}
          </div>
        ))}

        {/* Gap placeholders (Mendeleev) */}
        {layout.gaps?.map((gap, i) => (
          <div
            key={`gap-${i}`}
            className="border-2 border-dashed border-amber-300/40 dark:border-amber-700/40 rounded-md flex items-center justify-center text-[10px] text-amber-500/60 italic"
            style={{ gridColumnStart: gap.x, gridRowStart: gap.y }}
          >
            ?
          </div>
        ))}

        {/* Elements */}
        {elements.map((element) => {
          const pos = layout.positions.get(element.atomicNumber);
          if (!pos) return null;

          return (
            <MiniCell
              key={element.atomicNumber}
              element={element}
              isSelected={selectedElement?.atomicNumber === element.atomicNumber}
              isFavorite={favorites.includes(element.atomicNumber)}
              trendStyle={trendStyles[element.atomicNumber]}
              style={{ gridColumnStart: pos.x, gridRowStart: pos.y }}
              onSelect={onSelectElement}
              onHover={onHoverElement}
              isDraggable={isDraggable}
              onDragStart={onElementDragStart}
              onDragEnd={onElementDragEnd}
              onTouchStart={onElementTouchStart ? (e) => onElementTouchStart(element, e) : undefined}
              onTouchMove={onElementTouchMove}
              onTouchEnd={onElementTouchEnd}
              compact={tableMode === 'compact' || tableMode === 'ribbon' || tableMode === 'leftStep' || tableMode === 'block'}
            />
          );
        })}
      </div>
    </div>
  );
};

// ─── SPATIAL Renderer (circular, spiral, triangular) ───────────────────
const SpatialRenderer: React.FC<TableRendererProps> = (props) => {
  const {
    elements, selectedElement, favorites, onSelectElement, onHoverElement,
    selectedTrend, tableMode, isDraggable, onElementDragStart, onElementDragEnd,
    onElementTouchStart, onElementTouchMove, onElementTouchEnd,
  } = props;

  const engine = getLayoutEngine(tableMode);
  const layout = useMemo(() => engine(elements), [engine, elements]);
  const trendStyles = useTrendStyles(elements, selectedTrend);

  const containerW = layout.containerWidth || 900;
  const containerH = layout.containerHeight || 900;

  return (
    <div
      className="w-full overflow-auto overscroll-contain touch-pan-x touch-pan-y hide-scrollbar scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        className="relative mx-auto"
        style={{ width: containerW, height: containerH, minWidth: containerW }}
      >
        {/* Center dot for circular/spiral */}
        {(tableMode === 'circular' || tableMode === 'spiral') && (
          <div
            className="absolute w-3 h-3 bg-cyan-500 rounded-full opacity-40"
            style={{ left: containerW / 2 - 6, top: containerH / 2 - 6 }}
          />
        )}

        {elements.map((element) => {
          const pos = layout.positions.get(element.atomicNumber);
          if (!pos) return null;

          const cellW = pos.w || 44;
          const cellH = pos.h || 44;

          return (
            <MiniCell
              key={element.atomicNumber}
              element={element}
              isSelected={selectedElement?.atomicNumber === element.atomicNumber}
              isFavorite={favorites.includes(element.atomicNumber)}
              trendStyle={trendStyles[element.atomicNumber]}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: cellW,
                height: cellH,
              }}
              onSelect={onSelectElement}
              onHover={onHoverElement}
              isDraggable={isDraggable}
              onDragStart={onElementDragStart}
              onDragEnd={onElementDragEnd}
              onTouchStart={onElementTouchStart ? (e) => onElementTouchStart(element, e) : undefined}
              onTouchMove={onElementTouchMove}
              onTouchEnd={onElementTouchEnd}
              compact
            />
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN TABLE RENDERER ───────────────────────────────────────────────
const TableRenderer: React.FC<TableRendererProps> = (props) => {
  const meta = LAYOUT_META[props.tableMode];

  if (meta.renderType === 'spatial') {
    return <SpatialRenderer {...props} />;
  }

  return <GridRenderer {...props} themeClass={meta.themeClass} />;
};

export default TableRenderer;
