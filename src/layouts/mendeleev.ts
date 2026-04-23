import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * DIAMOND-CUT ACCURATE Mendeleev-style periodic table (Short Form - Simplified)
 * - Focused on the core 8-group system
 * - 12-column architecture: [Period, I, II, III, IV, V, VI, VII, VIII-A, VIII-B, VIII-C, 0]
 * - Removed footer blocks and extended sub-periods per user request
 */

const COL_I = 2;
const COL_II = 3;
const COL_III = 4;
const COL_IV = 5;
const COL_V = 6;
const COL_VI = 7;
const COL_VII = 8;
const COL_VIII_A = 9;
const COL_VIII_B = 10;
const COL_VIII_C = 11;
const COL_0 = 12;

const MENDELEEV_MAP: Record<number, LayoutPosition> = {
  // Period 1
  1: { x: COL_I, y: 2 },    // H
  2: { x: COL_0, y: 2 },    // He

  // Period 2
  3: { x: COL_I, y: 3 },    // Li
  4: { x: COL_II, y: 3 },   // Be
  5: { x: COL_III, y: 3 },  // B
  6: { x: COL_IV, y: 3 },   // C
  7: { x: COL_V, y: 3 },    // N
  8: { x: COL_VI, y: 3 },   // O
  9: { x: COL_VII, y: 3 },  // F
  10: { x: COL_0, y: 3 },   // Ne

  // Period 3
  11: { x: COL_I, y: 4 },   // Na
  12: { x: COL_II, y: 4 },  // Mg
  13: { x: COL_III, y: 4 }, // Al
  14: { x: COL_IV, y: 4 },  // Si
  15: { x: COL_V, y: 4 },   // P
  16: { x: COL_VI, y: 4 },  // S
  17: { x: COL_VII, y: 4 }, // Cl
  18: { x: COL_0, y: 4 },   // Ar

  // Period 4
  19: { x: COL_I, y: 5 },   // K
  20: { x: COL_II, y: 5 },  // Ca
  21: { x: COL_III, y: 5 }, // Sc
  22: { x: COL_IV, y: 5 },  // Ti
  23: { x: COL_V, y: 5 },   // V
  24: { x: COL_VI, y: 5 },  // Cr
  25: { x: COL_VII, y: 5 }, // Mn
  26: { x: COL_VIII_A, y: 5 }, // Fe
  27: { x: COL_VIII_B, y: 5 }, // Co
  28: { x: COL_VIII_C, y: 5 }, // Ni
  29: { x: COL_I, y: 6 },   // Cu
  30: { x: COL_II, y: 6 },  // Zn
  31: { x: COL_III, y: 6 }, // Ga
  32: { x: COL_IV, y: 6 },  // Ge
  33: { x: COL_V, y: 6 },   // As
  34: { x: COL_VI, y: 6 },  // Se
  35: { x: COL_VII, y: 6 }, // Br
  36: { x: COL_0, y: 6 },   // Kr

  // Period 5
  37: { x: COL_I, y: 7 },   // Rb
  38: { x: COL_II, y: 7 },  // Sr
  39: { x: COL_III, y: 7 }, // Y
  40: { x: COL_IV, y: 7 },  // Zr
  41: { x: COL_V, y: 7 },   // Nb
  42: { x: COL_VI, y: 7 },  // Mo
  43: { x: COL_VII, y: 7 }, // Tc
  44: { x: COL_VIII_A, y: 7 }, // Ru
  45: { x: COL_VIII_B, y: 7 }, // Rh
  46: { x: COL_VIII_C, y: 7 }, // Pd
  47: { x: COL_I, y: 8 },   // Ag
  48: { x: COL_II, y: 8 },  // Cd
  49: { x: COL_III, y: 8 }, // In
  50: { x: COL_IV, y: 8 },  // Sn
  51: { x: COL_V, y: 8 },   // Sb
  52: { x: COL_VI, y: 8 },  // Te
  53: { x: COL_VII, y: 8 }, // I
  54: { x: COL_0, y: 8 },   // Xe

  // Period 6
  55: { x: COL_I, y: 9 },   // Cs
  56: { x: COL_II, y: 9 },  // Ba
  57: { x: COL_III, y: 9 }, // La
  72: { x: COL_IV, y: 9 },  // Hf
  73: { x: COL_V, y: 9 },   // Ta
  74: { x: COL_VI, y: 9 },  // W
  75: { x: COL_VII, y: 9 }, // Re
  76: { x: COL_VIII_A, y: 9 }, // Os
  77: { x: COL_VIII_B, y: 9 }, // Ir
  78: { x: COL_VIII_C, y: 9 }, // Pt
};

export const mendeleevLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  for (const el of elements) {
    if (MENDELEEV_MAP[el.atomicNumber]) {
      positions.set(el.atomicNumber, MENDELEEV_MAP[el.atomicNumber]);
    }
  }

  // --- LABELS ---
  const groupNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', '', '', '0'];
  groupNames.forEach((name, i) => {
    if (i > 7 && i < 11 && !name) {
       if (i === 8) { /* VIII covers 9, 10, 11 */ }
       else return;
    }
    labels.push({
      text: name || (i === 8 ? 'VIII' : ''),
      x: i + 2,
      y: 1,
      type: 'group',
    });
  });

  const seriesLabels = [
    { text: '1', y: 2 },
    { text: '2', y: 3 },
    { text: '3', y: 4 },
    { text: '4', y: 5 },
    { text: '5', y: 6 },
    { text: '6', y: 7 },
    { text: '7', y: 8 },
    { text: '8', y: 9 },
  ];
  seriesLabels.forEach(s => {
    labels.push({ text: s.text, x: 1, y: s.y, type: 'period' });
  });

  return {
    positions,
    gridCols: 14,
    gridRows: 10,
    labels,
  };
};
