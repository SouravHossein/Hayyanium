import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Block-based (Orbital) periodic table.
 * Elements grouped by s/p/d/f blocks, each block rendered as
 * an independent section with clear visual separation.
 *
 * Layout grid (wide):
 *   f-block (14 cols)  |  d-block (10 cols)  |  p-block (6 cols)  |  s-block (2 cols)
 *   columns: 2-15       |  17-26              |  28-33             |  35-36
 */

function getBlockPosition(el: ElementData): LayoutPosition {
  const block = el.block;

  if (block === 's') {
    // s-block: 2 columns, right side
    const col = el.group === 1 ? 35 : 36;
    let row: number;
    if (el.atomicNumber === 2) row = 1; // Helium with H
    else row = el.period;
    return { x: col, y: row + 1 };
  }

  if (block === 'p') {
    // p-block: 6 columns
    const col = 28 + (el.group - 13);
    const row = el.period;
    return { x: col, y: row + 1 };
  }

  if (block === 'd') {
    // d-block: 10 columns
    const col = 17 + (el.group - 3);
    const row = el.period;
    return { x: col, y: row + 1 };
  }

  if (block === 'f') {
    // f-block: 14 columns
    if (el.category === 'lanthanide') {
      const col = 2 + (el.atomicNumber - 57);
      return { x: col, y: 7 }; // row 6 (period 6's f-block)
    } else {
      const col = 2 + (el.atomicNumber - 89);
      return { x: col, y: 8 }; // row 7 (period 7's f-block)
    }
  }

  // fallback
  return { x: 35, y: el.period + 1 };
}

export const blockLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  elements.forEach((el) => {
    positions.set(el.atomicNumber, getBlockPosition(el));
  });

  // Block section labels
  labels.push(
    { text: 'f-block', x: 8, y: 1, type: 'block' },
    { text: 'd-block', x: 21, y: 1, type: 'block' },
    { text: 'p-block', x: 30, y: 1, type: 'block' },
    { text: 's-block', x: 35, y: 1, type: 'block' },
  );

  return {
    positions,
    gridCols: 38,
    gridRows: 10,
    labels,
  };
};
