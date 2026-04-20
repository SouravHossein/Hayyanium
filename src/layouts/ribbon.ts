import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Ribbon / Continuous periodic table.
 * Elements laid out in a continuous strip by atomic number,
 * wrapping every 18 elements.
 */
export const ribbonLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];
  const cols = 18;

  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);

  sorted.forEach((el) => {
    const idx = el.atomicNumber - 1;
    const col = (idx % cols) + 2; // +2 for label col offset
    const row = Math.floor(idx / cols) + 2; // +2 for label row offset
    positions.set(el.atomicNumber, { x: col, y: row });
  });

  const totalRows = Math.ceil(elements.length / cols);

  // Column labels
  for (let c = 1; c <= cols; c++) {
    labels.push({ text: String(c), x: c + 1, y: 1, type: 'group' });
  }

  // Row labels (sequential row numbers)
  for (let r = 1; r <= totalRows; r++) {
    const firstZ = (r - 1) * cols + 1;
    const lastZ = Math.min(r * cols, elements.length);
    labels.push({ text: `${firstZ}-${lastZ}`, x: 1, y: r + 1, type: 'period' });
  }

  return {
    positions,
    gridCols: cols + 2,
    gridRows: totalRows + 2,
    labels,
  };
};
