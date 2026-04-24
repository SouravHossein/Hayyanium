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
  // Thorium (90) and Actinium (89) etc. may sometimes be tagged with block 'd' 
  // depending on dataset definitions. Force all lanthanides/actinides to the f-block
  // for the purpose of the Block layout.
  const block = (el.category === 'lanthanide' || el.category === 'actinide') ? 'f' : el.block;

  if (block === 's') {
    // s-block: 2 columns, left side
    const col = el.group === 1 ? 2 : 3;
    let row: number;
    if (el.atomicNumber === 2) row = 1; // Helium with H
    else row = el.period;
    return { x: col, y: row + 1 };
  }

  if (block === 'f') {
    // f-block: 14 columns max (cols 5-18)
    let colOffset = 0;
    if (el.category === 'lanthanide') {
      colOffset = el.atomicNumber - 57;
      if (colOffset > 13) colOffset = 13; // Clamp to 14 cols
      return { x: 5 + colOffset, y: 7 }; // row 6 (period 6's f-block)
    } else {
      colOffset = el.atomicNumber - 89;
      if (colOffset > 13) colOffset = 13;
      return { x: 5 + colOffset, y: 8 }; // row 7 (period 7's f-block)
    }
  }

  if (block === 'd') {
    // d-block: 10 columns (20-29)
    const col = 20 + (el.group - 3);
    const row = el.period;
    return { x: col, y: row + 1 };
  }

  if (block === 'p') {
    // p-block: 6 columns (31-36)
    const col = 31 + (el.group - 13);
    const row = el.period;
    return { x: col, y: row + 1 };
  }

  // fallback
  return { x: 2, y: el.period + 1 };
}

export const blockLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  elements.forEach((el) => {
    positions.set(el.atomicNumber, getBlockPosition(el));
  });

  // Block section labels
  labels.push(
    { text: 's-block', x: 2, y: 1, type: 'block' },
    { text: 'f-block', x: 11, y: 1, type: 'block' },
    { text: 'd-block', x: 24, y: 1, type: 'block' },
    { text: 'p-block', x: 33, y: 1, type: 'block' },
  );

  return {
    positions,
    gridCols: 38,
    gridRows: 10,
    labels,
  };
};
