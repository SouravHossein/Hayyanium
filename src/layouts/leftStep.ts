import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Charles Janet Left-Step Periodic Table.
 * Based on electron orbital filling (Madelung rule).
 * s-block shifted to far right, He placed with alkaline earths.
 * Rows correspond to n+l values.
 */

// Janet table: rows are based on n+l quantum number pairs
// The table has 8 rows (n+l from 1 to 8) and up to 32 columns

interface JanetPos { col: number; row: number; }

function getJanetPosition(el: ElementData): JanetPos {
  const z = el.atomicNumber;
  const block = el.block;

  // Janet rows (based on n+l filling):
  // Row 1: 1s (H, He) -> n+l=1
  // Row 2: 2s (Li, Be) -> n+l=2
  // Row 3: 2p, 3s (B-Ne, Na-Mg) -> n+l=3
  // Row 4: 3p, 4s (Al-Ar, K-Ca) -> n+l=4
  // Row 5: 3d, 4p, 5s -> n+l=5
  // Row 6: 4d, 5p, 6s -> n+l=6
  // Row 7: 4f, 5d, 6p, 7s -> n+l=7
  // Row 8: 5f, 6d, 7p, 8s -> n+l=8

  // Simplified mapping using period and block
  let row: number;
  let col: number;

  if (block === 'f') {
    // f-block: columns 1-14 (leftmost)
    if (el.category === 'lanthanide') {
      row = 7;
      col = z - 57 + 1; // La(57)=1..Lu(71)=15? -> actually Ce(58)-Lu(71)=14 elements + La
      col = z - 56; // La=1, Ce=2, ..., Lu=15 → but f-block is 14 wide
      if (z === 57) col = 1; // La
      else col = z - 57 + 1;
    } else {
      // Actinides
      row = 8;
      if (z === 89) col = 1; // Ac
      else col = z - 89 + 1;
    }
  } else if (block === 'd') {
    // d-block: columns 15-24 (after f-block, 10 wide)
    if (el.period === 4) { row = 5; col = (z - 21) + 15; } // Sc(21)-Zn(30)
    else if (el.period === 5) { row = 6; col = (z - 39) + 15; } // Y(39)-Cd(48)
    else if (el.period === 6) { row = 7; col = (z - 71) + 15; } // Lu already counted in f, La-Lu then Hf(72)-Hg(80)
    else if (el.period === 7) { row = 8; col = (z - 103) + 15; } // Lr already counted, Rf(104)-Cn(112)
    else { row = el.period; col = 15; }
    // Clamp
    if (col > 24) col = 24;
    if (col < 15) col = 15;
  } else if (block === 'p') {
    // p-block: columns 25-30 (6 wide)
    const groupOffset = el.group - 13; // group 13=0, 14=1, ..., 18=5
    col = 25 + groupOffset;
    if (el.period <= 2) row = el.period + 1;
    else if (el.period <= 4) row = el.period;
    else row = el.period;
    // Adjust for Janet row scheme
    if (el.period === 2) row = 3;
    else if (el.period === 3) row = 4;
    else if (el.period === 4) row = 5;
    else if (el.period === 5) row = 6;
    else if (el.period === 6) row = 7;
    else if (el.period === 7) row = 8;
    else row = el.period;
  } else {
    // s-block: columns 31-32 (rightmost, 2 wide)
    if (el.group === 1) col = 31;
    else col = 32; // group 2 or He

    // Helium → row 1 (with H)
    if (z === 2) { row = 1; col = 32; }
    else if (z === 1) { row = 1; col = 31; }
    else if (el.period === 2) row = 2;
    else if (el.period === 3) row = 3;
    else if (el.period === 4) row = 4;
    else if (el.period === 5) row = 5;
    else if (el.period === 6) row = 6;
    else if (el.period === 7) row = 7;
    else row = el.period;
  }

  return { col, row };
}

export const leftStepLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  elements.forEach((el) => {
    const pos = getJanetPosition(el);
    positions.set(el.atomicNumber, { x: pos.col + 1, y: pos.row + 1 }); // +1 for labels
  });

  // Block labels
  const blockLabels = [
    { text: 'f-block', x: 8, y: 1, type: 'block' as const },
    { text: 'd-block', x: 20, y: 1, type: 'block' as const },
    { text: 'p-block', x: 28, y: 1, type: 'block' as const },
    { text: 's-block', x: 32, y: 1, type: 'block' as const },
  ];
  labels.push(...blockLabels);

  // Row labels
  for (let r = 1; r <= 8; r++) {
    labels.push({ text: String(r), x: 1, y: r + 1, type: 'period' });
  }

  return {
    positions,
    gridCols: 34, // 1 label + 32 cols + buffer
    gridRows: 10, // 1 label + 8 rows + buffer
    labels,
  };
};
