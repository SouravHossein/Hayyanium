import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Compact / Short-form 8-column periodic table.
 * Groups collapsed into broad families, beginner-friendly.
 */

function getCompactGroup(el: ElementData): number {
  const g = el.group;
  // Map 18 groups → 8 columns:
  // 1 → 1 (Alkali)
  // 2 → 2 (Alkaline Earth)
  // 3-12 → 3 (Transition metals — compressed)
  // 13 → 4
  // 14 → 5
  // 15 → 6
  // 16 → 7
  // 17-18 → 8 (Halogens + Noble gases)
  if (g === 1) return 1;
  if (g === 2) return 2;
  if (g >= 3 && g <= 12) return 3;
  if (g === 13) return 4;
  if (g === 14) return 5;
  if (g === 15) return 6;
  if (g === 16) return 7;
  if (g >= 17) return 8;
  return 3;
}

function getCompactRow(el: ElementData): number {
  if (el.category === 'lanthanide') return 9;
  if (el.category === 'actinide') return 10;
  return el.period;
}

export const compactLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  // Track slots to offset collisions in the transition metal column
  const slotCounts = new Map<string, number>();

  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);

  sorted.forEach((el) => {
    const col = getCompactGroup(el) + 1; // +1 for label
    let row = getCompactRow(el) + 1;     // +1 for label

    const key = `${col}-${row}`;
    const count = slotCounts.get(key) || 0;

    if (col === 4 && count > 0) {
      // Transition metals stack — shift down
      row += count;
    }
    slotCounts.set(key, count + 1);
    positions.set(el.atomicNumber, { x: col, y: row });
  });

  // Group labels
  const groupNames = ['IA', 'IIA', 'TM', 'IIIA', 'IVA', 'VA', 'VIA', 'VII-VIII'];
  groupNames.forEach((name, i) => {
    labels.push({ text: name, x: i + 2, y: 1, type: 'group' });
  });

  // Period labels
  for (let p = 1; p <= 10; p++) {
    labels.push({ text: String(p), x: 1, y: p + 1, type: 'period' });
  }

  return {
    positions,
    gridCols: 10,
    gridRows: 12,
    labels,
  };
};
