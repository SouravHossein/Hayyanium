import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Mendeleev's 8-column periodic table (1869-style).
 * Maps modern groups → 8 Mendeleev groups.
 * Shows "gaps" for conceptual predicted elements.
 */

// Map modern group → Mendeleev group (1-8)
function getMendeleevGroup(el: ElementData): number {
  const g = el.group;
  if (g === 1) return 1;   // IA
  if (g === 2) return 2;   // IIA
  if (g >= 3 && g <= 7) return 3;   // IIIB-VIIB → compressed into III
  if (g >= 8 && g <= 10) return 4;  // VIII group (Fe, Co, Ni triads)
  if (g === 11) return 5;  // IB → Cu group
  if (g === 12) return 6;  // IIB → Zn group
  if (g >= 13 && g <= 15) return 7; // IIIA-VA
  if (g >= 16 && g <= 18) return 8; // VIA-VIIIA
  return 4; // fallback
}

function getMendeleevRow(el: ElementData): number {
  // Lanthanides and actinides get extra rows
  if (el.category === 'lanthanide') return 9;
  if (el.category === 'actinide') return 10;
  return el.period;
}

export const mendeleevLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];
  const gaps: LayoutPosition[] = [];

  // Track grid slots to handle collisions
  const occupied = new Map<string, number>();

  // Sort by atomic mass (approximated by atomicNumber for stability)
  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);

  sorted.forEach((el) => {
    const col = getMendeleevGroup(el) + 1; // +1 for label col
    let row = getMendeleevRow(el) + 1;     // +1 for label row

    // Handle collisions within same cell
    let key = `${col}-${row}`;
    let attempts = 0;
    while (occupied.has(key) && attempts < 5) {
      row++;
      key = `${col}-${row}`;
      attempts++;
    }
    occupied.set(key, el.atomicNumber);
    positions.set(el.atomicNumber, { x: col, y: row });
  });

  // Group labels
  const groupNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  groupNames.forEach((name, i) => {
    labels.push({ text: name, x: i + 2, y: 1, type: 'group' });
  });

  // Period labels
  for (let p = 1; p <= 10; p++) {
    labels.push({ text: String(p), x: 1, y: p + 1, type: 'period' });
  }

  // Mendeleev's famous gaps (Eka-aluminum=Ga, Eka-silicon=Ge, Eka-boron=Sc concept)
  // These are decorative — they don't represent real missing elements
  gaps.push(
    { x: 7, y: 3 }, // Period 2, Group VII — conceptual gap
    { x: 8, y: 3 }, // Period 2, Group VIII 
  );

  return {
    positions,
    gridCols: 10,  // 1 label + 8 groups + buffer
    gridRows: 12,  // 1 label + 10 rows + buffer
    labels,
    gaps,
  };
};
