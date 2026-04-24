import React, { useMemo } from 'react';
import { ElementData, Trend } from '../../types';
import { TableMode, LAYOUT_META } from '../../layouts';
import { getLayoutEngine } from '../../layouts';
import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '../../constants';
import Link from 'next/link';
import { TableDetailLevel } from './zoomTypes';

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
  detailLevel?: TableDetailLevel;
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
  detailLevel?: TableDetailLevel;
}

const MiniCell: React.FC<MiniCellProps> = ({
  element, isSelected, isFavorite, trendStyle, style,
  onSelect, onHover, isDraggable, onDragStart, onDragEnd,
  onTouchStart, onTouchMove, onTouchEnd, compact, detailLevel = 'medium',
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
      className={`relative rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${colorClass} ${textColorClass} ${isSelected ? 'ring-2 ring-cyan-400 z-20 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''
        } ${isDraggable ? 'cursor-grab' : ''}`}
      id={`element-${element.atomicNumber}`}
      style={{
        ...style,
        ...(trendStyle || {}),
        overflow: 'hidden',
        padding: compact
          ? 'clamp(1px, calc(var(--table-cell-size, 56px) * 0.04), 3px)'
          : 'clamp(2px, calc(var(--table-cell-size, 56px) * 0.07), 5px)',
        border: detailLevel === 'small' ? '1px solid rgba(255,255,255,0.12)' : undefined,
      }}
    >
      {/* Content */}
      <div className={`flex flex-col items-center justify-center h-full w-full ${detailLevel === 'small' ? 'opacity-90' : ''}`}>
        {detailLevel !== 'small' && (
          <span className={`absolute top-0 left-0.5 ${compact ? 'text-[7px]' : 'text-[9px]'} font-medium opacity-70`}>
            {element.atomicNumber}
          </span>
        )}
        {detailLevel === 'large' && !trendStyle && (
          <span className={`absolute top-0 right-0.5 w-1.5 h-1.5 rounded-sm ${blockColor}`} />
        )}
        {isFavorite && (
          <span className="absolute top-0 right-0.5 text-[8px] text-yellow-300">*</span>
        )}
        <span className={`${compact ? (detailLevel === 'large' ? 'text-sm' : 'text-[10px]') : (detailLevel === 'small' ? 'text-sm' : detailLevel === 'medium' ? 'text-lg' : 'text-lg sm:text-xl')} font-bold leading-none`}>
          {element.symbol}
        </span>
        {detailLevel === 'large' && !compact && (
          <span className="text-[8px] sm:text-[10px] truncate max-w-full leading-none mt-0.5 font-medium">
            {element.name}
          </span>
        )}
      </div>
    </Link>
  );
};

const MemoMiniCell = React.memo(MiniCell);

// ─── GRID Renderer ─────────────────────────────────────────────────────
const GridRenderer: React.FC<TableRendererProps & { themeClass?: string }> = (props) => {
  const {
    elements, selectedElement, favorites, onSelectElement, onHoverElement,
    selectedTrend, tableMode, isDraggable, onElementDragStart, onElementDragEnd,
    onElementTouchStart, onElementTouchMove, onElementTouchEnd, themeClass, detailLevel = 'medium',
  } = props;

  const engine = getLayoutEngine(tableMode);
  const layout = useMemo(() => engine(elements), [engine, elements]);
  const trendStyles = useTrendStyles(elements, selectedTrend);

  const gridCols = layout.gridCols || 20;
  const gridRows = layout.gridRows || 11;

  const gridTemplate = {
    gridTemplateColumns: `var(--table-label-size, 34px) repeat(${Math.max(1, gridCols - 1)}, var(--table-cell-size, 56px))`,
    gridTemplateRows: `var(--table-label-size, 34px) repeat(${Math.max(1, gridRows - 1)}, var(--table-cell-size, 56px))`,
    gap: 'var(--table-gap-size, 4px)',
  };

  return (
    <div
      className={`inline-block align-top ${themeClass || ''}`}
    >
      <div
        className="grid"
        style={gridTemplate}
      >
        {/* Labels */}
        {layout.labels?.map((label, i) => (
          <div
            key={`label-${i}`}
            className={`flex items-center justify-center font-bold ${label.type === 'block'
                ? 'text-cyan-500 dark:text-cyan-400 uppercase tracking-wider'
                : 'text-gray-400 dark:text-gray-500'
              }`}
            style={{
              gridColumnStart: label.x,
              gridRowStart: label.y,
              fontSize: label.type === 'block'
                ? 'clamp(8px, calc(var(--table-label-size, 34px) * 0.23), 12px)'
                : 'clamp(9px, calc(var(--table-label-size, 34px) * 0.28), 13px)',
            }}
          >
            {label.text}
          </div>
        ))}

        {/* Gap placeholders (Mendeleev) */}
        {layout.gaps?.map((gap, i) => (
          <div
            key={`gap-${i}`}
            className="border-2 border-dashed border-amber-300/40 dark:border-amber-700/40 rounded-md flex items-center justify-center text-amber-500/60 italic"
            style={{
              gridColumnStart: gap.x,
              gridRowStart: gap.y,
              fontSize: 'clamp(9px, calc(var(--table-cell-size, 56px) * 0.22), 14px)',
            }}
          >
            ?
          </div>
        ))}

        {/* Elements */}
        {elements.map((element) => {
          const pos = layout.positions.get(element.atomicNumber);
          if (!pos) return null;

          return (
            <MemoMiniCell
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
              compact={tableMode === 'leftStep' || tableMode === 'block'}
              detailLevel={detailLevel}
            />
          );
        })}
      </div>
    </div>
  );
};

// ─── SPATIAL Renderer (circular, triangular) ───────────────────
const SpatialRenderer: React.FC<TableRendererProps> = (props) => {
  const {
    elements, selectedElement, favorites, onSelectElement, onHoverElement,
    selectedTrend, tableMode, isDraggable, onElementDragStart, onElementDragEnd,
    onElementTouchStart, onElementTouchMove, onElementTouchEnd, detailLevel = 'medium',
  } = props;

  const engine = getLayoutEngine(tableMode);
  const layout = useMemo(() => engine(elements), [engine, elements]);
  const trendStyles = useTrendStyles(elements, selectedTrend);

  const containerW = layout.containerWidth || 900;
  const containerH = layout.containerHeight || 900;

  // Spin rotation logic
  const [rotation, setRotation] = React.useState(0);
  const isSpinning = React.useRef(false);
  const startAngle = React.useRef(0);
  const hasDragged = React.useRef(false);

  // Reset rotation when leaving circular mode
  React.useEffect(() => {
    if (tableMode !== 'circular') {
      setRotation(0);
    }
  }, [tableMode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tableMode !== 'circular') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    isSpinning.current = true;
    hasDragged.current = false;

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    startAngle.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSpinning.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    let delta = currentAngle - startAngle.current;

    // Handle wrapping around Math.PI / -Math.PI
    if (delta > Math.PI) delta -= 2 * Math.PI;
    else if (delta < -Math.PI) delta += 2 * Math.PI;

    if (Math.abs(delta) > 0.02) {
      hasDragged.current = true;
    }

    const deltaDeg = delta * (180 / Math.PI);
    setRotation(prev => prev + deltaDeg);

    startAngle.current = currentAngle;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSpinning.current) {
      isSpinning.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDragged.current = false;
    }
  };

  // Prevent default drag and drop breaking the spin action
  const handleDragStartContainer = (e: React.DragEvent) => {
    if (tableMode === 'circular') {
      e.preventDefault();
    }
  };

  return (
    <div
      className="w-full overscroll-contain hide-scrollbar"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        className="mx-auto"
        style={{
          width: containerW,
          height: containerH,
          minWidth: containerW,
          position: 'relative',
          transform: tableMode === 'circular' ? `rotate(${rotation}deg)` : 'none',
          touchAction: tableMode === 'circular' ? 'none' : 'auto', // Prevents scrolling while spinning
          cursor: tableMode === 'circular' ? (isSpinning.current ? 'grabbing' : 'grab') : 'default'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        onDragStart={handleDragStartContainer}
      >
        {/* Center dot for circular */}
        {tableMode === 'circular' && (
          <div
            className="absolute w-3 h-3 bg-cyan-500 rounded-full opacity-40 pointer-events-none"
            style={{ left: containerW / 2 - 6, top: containerH / 2 - 6 }}
          />
        )}

        {elements.map((element) => {
          const pos = layout.positions.get(element.atomicNumber);
          if (!pos) return null;

          const cellW = pos.w || 44;
          const cellH = pos.h || 44;

          return (
            <div
              key={`wrapper-${element.atomicNumber}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: cellW,
                height: cellH,
                // Inverse rotation so text stays upright
                transform: tableMode === 'circular' ? `rotate(${-rotation}deg)` : 'none',
                pointerEvents: 'auto',
                transition: isSpinning.current ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <MemoMiniCell
                element={element}
                isSelected={selectedElement?.atomicNumber === element.atomicNumber}
                isFavorite={favorites.includes(element.atomicNumber)}
                trendStyle={trendStyles[element.atomicNumber]}
                style={{ display: 'block', width: '100%', height: '100%' }}
                onSelect={onSelectElement}
                onHover={onHoverElement}
                isDraggable={isDraggable}
                onDragStart={onElementDragStart}
                onDragEnd={onElementDragEnd}
                onTouchStart={onElementTouchStart ? (e) => onElementTouchStart(element, e) : undefined}
                onTouchMove={onElementTouchMove}
                onTouchEnd={onElementTouchEnd}
                compact
                detailLevel={detailLevel}
              />
            </div>
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

export default React.memo(TableRenderer);

