import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Triangular periodic table.
 * Each period row widens, elements centered within their row.
 */
export const triangularLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const cellSize = 44;
  const cellGap = 4;
  const rowGap = 8;

  // Group elements by period
  const periods = new Map<number, ElementData[]>();
  elements.forEach((el) => {
    const p = el.category === 'lanthanide' ? 8 : el.category === 'actinide' ? 9 : el.period;
    if (!periods.has(p)) periods.set(p, []);
    periods.get(p)!.push(el);
  });

  // Sort within each period by group
  periods.forEach((els) => els.sort((a, b) => a.group - b.group));

  // Find max period width for centering
  let maxWidth = 0;
  periods.forEach((els) => {
    const w = els.length * (cellSize + cellGap);
    if (w > maxWidth) maxWidth = w;
  });

  const totalWidth = maxWidth + 100;
  let currentY = 40;

  const sortedPeriods = Array.from(periods.keys()).sort((a, b) => a - b);

  sortedPeriods.forEach((periodNum) => {
    const els = periods.get(periodNum)!;
    const rowWidth = els.length * (cellSize + cellGap);
    const startX = (totalWidth - rowWidth) / 2;

    els.forEach((el, idx) => {
      positions.set(el.atomicNumber, {
        x: startX + idx * (cellSize + cellGap),
        y: currentY,
        w: cellSize,
        h: cellSize,
      });
    });

    currentY += cellSize + rowGap;
  });

  return {
    positions,
    containerWidth: totalWidth,
    containerHeight: currentY + 40,
  };
};
