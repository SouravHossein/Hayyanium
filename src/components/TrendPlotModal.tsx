import React, { useEffect, useRef } from 'react';
import { ElementData, Trend } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TrendPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementsToPlot: ElementData[];
  trend: Trend;
  trendLabel: string;
  trendUnit: string;
  title: string;
}

const TrendPlotModal: React.FC<TrendPlotModalProps> = ({
  isOpen,
  onClose,
  elementsToPlot,
  trend,
  trendLabel,
  trendUnit,
  title,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.focus(), 0);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const plotData = elementsToPlot
    .filter(
      (element): element is ElementData & Record<Trend, number> =>
        element[trend] !== null && typeof element[trend] === 'number',
    )
    .sort((a, b) => a.atomicNumber - b.atomicNumber);

  const isDark = theme === 'dark';
  const chartWidth = 760;
  const chartHeight = 320;
  const padding = { top: 24, right: 24, bottom: 50, left: 64 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const strokeColor = '#06b6d4';
  const fillColor = isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.12)';
  const values = plotData.map((element) => element[trend]);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const paddedMin =
    minValue === maxValue ? minValue - 1 : minValue - (maxValue - minValue) * 0.1;
  const paddedMax =
    minValue === maxValue ? maxValue + 1 : maxValue + (maxValue - minValue) * 0.1;
  const yTicks = Array.from(
    { length: 5 },
    (_, index) => paddedMin + ((paddedMax - paddedMin) / 4) * index,
  );

  const toX = (index: number) => {
    if (plotData.length <= 1) {
      return padding.left + innerWidth / 2;
    }

    return padding.left + (index / (plotData.length - 1)) * innerWidth;
  };

  const toY = (value: number) => {
    if (paddedMax === paddedMin) {
      return padding.top + innerHeight / 2;
    }

    return padding.top + ((paddedMax - value) / (paddedMax - paddedMin)) * innerHeight;
  };

  const linePath = plotData
    .map((element, index) => `${index === 0 ? 'M' : 'L'} ${toX(index)} ${toY(element[trend])}`)
    .join(' ');

  const areaPath =
    plotData.length > 0
      ? `${linePath} L ${toX(plotData.length - 1)} ${padding.top + innerHeight} L ${toX(0)} ${padding.top + innerHeight} Z`
      : '';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trend-plot-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex h-full max-h-[60vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl outline-none dark:bg-gray-800"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 id="trend-plot-title" className="text-xl font-bold text-cyan-600 dark:text-cyan-300">
            {title} - {trendLabel}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close trend plot"
            className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="relative flex-grow p-4">
          {plotData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              No numeric data available for this trend.
            </div>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-full w-full overflow-visible"
              role="img"
              aria-label={`${title} ${trendLabel} chart`}
            >
              {yTicks.map((tick) => {
                const y = toY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={padding.left}
                      x2={chartWidth - padding.right}
                      y1={y}
                      y2={y}
                      stroke={gridColor}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill={textColor}
                    >
                      {tick.toFixed(trend === 'electronegativity' ? 1 : 0)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={padding.left}
                x2={padding.left}
                y1={padding.top}
                y2={padding.top + innerHeight}
                stroke={textColor}
                strokeWidth="1"
              />
              <line
                x1={padding.left}
                x2={padding.left + innerWidth}
                y1={padding.top + innerHeight}
                y2={padding.top + innerHeight}
                stroke={textColor}
                strokeWidth="1"
              />

              <path d={areaPath} fill={fillColor} />
              <path
                d={linePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {plotData.map((element, index) => {
                const x = toX(index);
                const y = toY(element[trend]);
                return (
                  <g key={element.atomicNumber}>
                    <circle cx={x} cy={y} r="5" fill={strokeColor} />
                    <title>
                      {`${element.name} (${element.symbol}) - ${element[trend]}${trendUnit ? ` ${trendUnit}` : ''}`}
                    </title>
                    <text x={x} y={chartHeight - 18} textAnchor="middle" fontSize="12" fill={textColor}>
                      {element.symbol}
                    </text>
                  </g>
                );
              })}

              <text
                x={padding.left + innerWidth / 2}
                y={chartHeight - 4}
                textAnchor="middle"
                fontSize="13"
                fill={textColor}
              >
                Element (by Atomic Number)
              </text>
              <text
                x={18}
                y={padding.top + innerHeight / 2}
                textAnchor="middle"
                fontSize="13"
                fill={textColor}
                transform={`rotate(-90 18 ${padding.top + innerHeight / 2})`}
              >
                {trendLabel}
                {trendUnit ? ` (${trendUnit})` : ''}
              </text>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendPlotModal;
