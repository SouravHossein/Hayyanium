import { ElementData } from '../types';
import { LayoutEngine, LayoutResult } from './types';

/** Modern IUPAC 18-column layout — uses existing xpos/ypos from data */
export const modernLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, { x: number; y: number }>();
  const labels: LayoutResult['labels'] = [];

  elements.forEach((el) => {
    // +1 offset for row/col labels
    positions.set(el.atomicNumber, { x: el.xpos + 1, y: el.ypos + 1 });
  });

  // Group labels (row 1)
  for (let g = 1; g <= 18; g++) {
    labels.push({ text: String(g), x: g + 1, y: 1, type: 'group' });
  }
  // Period labels (col 1)
  for (let p = 1; p <= 7; p++) {
    labels.push({ text: String(p), x: 1, y: p + 1, type: 'period' });
  }

  return {
    positions,
    gridCols: 20, // 1 label + 18 groups + 1 buffer
    gridRows: 11, // 1 label + 7 periods + 2 lanthanide/actinide + 1 buffer
    labels,
  };
};
