import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * J. A. R. Newlands' Law of Octaves (1866)
 * Historical representation mapping elements by ordinal intervals based on atomic weight, 
 * illustrating the first true numeric periodicity before Mendeleev.
 */

const NEWLAND_MAP: Record<number, LayoutPosition> = {
  // Row 1 (Halogens analogs)
  1: { x: 2, y: 2 },    // H
  9: { x: 3, y: 2 },    // F
  17: { x: 4, y: 2 },   // Cl
  27: { x: 5, y: 2 },   // Co (shared)
  28: { x: 5, y: 2 },   // Ni (shared)
  35: { x: 6, y: 2 },   // Br
  46: { x: 7, y: 2 },   // Pd
  53: { x: 8, y: 2 },   // I
  78: { x: 9, y: 2 },   // Pt (shared)
  77: { x: 9, y: 2 },   // Ir (shared)

  // Row 2 (Alkali analogs)
  3: { x: 2, y: 3 },    // Li
  11: { x: 3, y: 3 },   // Na
  19: { x: 4, y: 3 },   // K
  29: { x: 5, y: 3 },   // Cu
  37: { x: 6, y: 3 },   // Rb
  47: { x: 7, y: 3 },   // Ag
  55: { x: 8, y: 3 },   // Cs
  81: { x: 9, y: 3 },   // Tl

  // Row 3 (Alkaline earth analogs)
  4: { x: 2, y: 4 },    // Be (G)
  12: { x: 3, y: 4 },   // Mg
  20: { x: 4, y: 4 },   // Ca
  30: { x: 5, y: 4 },   // Zn
  38: { x: 6, y: 4 },   // Sr
  48: { x: 7, y: 4 },   // Cd
  56: { x: 8, y: 4 },   // Ba (shared)
  23: { x: 8, y: 4 },   // V (shared)
  82: { x: 9, y: 4 },   // Pb

  // Row 4 (Boron group analogs)
  5: { x: 2, y: 5 },    // B (Bo)
  13: { x: 3, y: 5 },   // Al
  24: { x: 4, y: 5 },   // Cr
  39: { x: 5, y: 5 },   // Y
  58: { x: 6, y: 5 },   // Ce (shared)
  57: { x: 6, y: 5 },   // La (shared)
  92: { x: 7, y: 5 },   // U
  73: { x: 8, y: 5 },   // Ta
  90: { x: 9, y: 5 },   // Th

  // Row 5 (Carbon group analogs)
  6: { x: 2, y: 6 },    // C
  14: { x: 3, y: 6 },   // Si
  22: { x: 4, y: 6 },   // Ti
  49: { x: 5, y: 6 },   // In
  40: { x: 6, y: 6 },   // Zr
  50: { x: 7, y: 6 },   // Sn
  74: { x: 8, y: 6 },   // W
  80: { x: 9, y: 6 },   // Hg

  // Row 6 (Nitrogen group analogs)
  7: { x: 2, y: 7 },    // N
  15: { x: 3, y: 7 },   // P
  25: { x: 4, y: 7 },   // Mn
  33: { x: 5, y: 7 },   // As
  42: { x: 6, y: 7 },   // Mo (shared)
  59: { x: 6, y: 7 },   // Pr (Didymium part 1, shared)
  60: { x: 6, y: 7 },   // Nd (Didymium part 2, shared)
  51: { x: 7, y: 7 },   // Sb
  41: { x: 8, y: 7 },   // Nb
  83: { x: 9, y: 7 },   // Bi

  // Row 7 (Oxygen group analogs)
  8: { x: 2, y: 8 },    // O
  16: { x: 3, y: 8 },   // S
  26: { x: 4, y: 8 },   // Fe
  34: { x: 5, y: 8 },   // Se
  45: { x: 6, y: 8 },   // Rh (Ro, shared)
  44: { x: 6, y: 8 },   // Ru (shared)
  52: { x: 7, y: 8 },   // Te
  79: { x: 8, y: 8 },   // Au
  76: { x: 9, y: 8 },   // Os
};

export const newlandLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const labels: LayoutResult['labels'] = [];

  for (const el of elements) {
    if (NEWLAND_MAP[el.atomicNumber]) {
      positions.set(el.atomicNumber, NEWLAND_MAP[el.atomicNumber]);
    }
  }

  // Column headers resembling musical octaves
  const octaveNames = ['Do (I)', 'Re (II)', 'Mi (III)', 'Fa (IV)', 'Sol (V)', 'La (VI)', 'Ti (VII)', 'Do′ (VIII)'];
  octaveNames.forEach((name, i) => {
    labels.push({
      text: name,
      x: i + 2,
      y: 1,
      type: 'group',
    });
  });

  return {
    positions,
    gridCols: 10,
    gridRows: 9,
    labels,
  };
};
