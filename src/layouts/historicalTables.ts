export type HistoricalTableMode = 'mendeleev' | 'newland';

export type HistoricalCellKind =
  | 'header'
  | 'headerNote'
  | 'rowHeader'
  | 'annexHeader'
  | 'element'
  | 'composite'
  | 'predicted'
  | 'archaic';

export type HistoricalCellEmphasis = 'heavy' | 'anomaly';

export interface HistoricalCell {
  row: number;
  col: number;
  symbolText: string;
  subText?: string;
  cellKind: HistoricalCellKind;
  colSpan?: number;
  emphasis?: HistoricalCellEmphasis;
  linkedAtomicNumber?: number;
}

export interface HistoricalTableSpec {
  id: HistoricalTableMode;
  rows: number;
  cols: number;
  columnTemplate: string;
  cells: HistoricalCell[];
}

interface RowCellSeed {
  symbolText: string;
  subText?: string;
  cellKind?: Exclude<HistoricalCellKind, 'header' | 'headerNote' | 'rowHeader' | 'annexHeader'>;
  emphasis?: HistoricalCellEmphasis;
}

const seed = (
  symbolText: string,
  subText: string,
  cellKind: RowCellSeed['cellKind'] = 'element',
  emphasis?: HistoricalCellEmphasis,
): RowCellSeed => ({ symbolText, subText, cellKind, emphasis });

const mendeleevSpec = (() => {
  const cells: HistoricalCell[] = [];

  cells.push({ row: 1, col: 1, symbolText: '0', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 2, symbolText: 'I', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 3, symbolText: 'II', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 4, symbolText: 'III', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 5, symbolText: 'IV', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 6, symbolText: 'V', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 7, symbolText: 'VI', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 8, symbolText: 'VII', cellKind: 'header', colSpan: 1 });
  cells.push({ row: 1, col: 9, symbolText: 'VIII', cellKind: 'header', colSpan: 3 });
  cells.push({ row: 2, col: 2, symbolText: 'H', cellKind: 'element' });
  cells.push({ row: 3, col: 1, symbolText: 'He', cellKind: 'element' });
  cells.push({ row: 3, col: 2, symbolText: 'Li', cellKind: 'element' });
  cells.push({ row: 3, col: 3, symbolText: 'Be', cellKind: 'element' });
  cells.push({ row: 3, col: 4, symbolText: 'B', cellKind: 'element' });
  cells.push({ row: 3, col: 5, symbolText: 'C', cellKind: 'element' });
  cells.push({ row: 3, col: 6, symbolText: 'N', cellKind: 'element' });
  cells.push({ row: 3, col: 7, symbolText: 'O', cellKind: 'element' });
  cells.push({ row: 3, col: 8, symbolText: 'F', cellKind: 'element' });
  cells.push({ row: 4, col: 1, symbolText: 'Ne', cellKind: 'element' });
  cells.push({ row: 4, col: 2, symbolText: 'Na', cellKind: 'element' });
  cells.push({ row: 4, col: 3, symbolText: 'Mg', cellKind: 'element' });
  cells.push({ row: 4, col: 4, symbolText: 'Al', cellKind: 'element' });
  cells.push({ row: 4, col: 5, symbolText: 'Si', cellKind: 'element' });
  cells.push({ row: 4, col: 6, symbolText: 'P', cellKind: 'element' });
  cells.push({ row: 4, col: 7, symbolText: 'S', cellKind: 'element' });
  cells.push({ row: 4, col: 8, symbolText: 'Cl', cellKind: 'element' });
  cells.push({ row: 5, col: 1, symbolText: 'Ar', cellKind: 'element' });
  cells.push({ row: 5, col: 2, symbolText: 'K', cellKind: 'element' });
  cells.push({ row: 5, col: 3, symbolText: 'Ca', cellKind: 'element' });
  cells.push({ row: 5, col: 4, symbolText: 'Sc', cellKind: 'element' });
  cells.push({ row: 5, col: 5, symbolText: 'Ti', cellKind: 'element' });
  cells.push({ row: 5, col: 6, symbolText: 'V', cellKind: 'element' });
  cells.push({ row: 5, col: 7, symbolText: 'Cr', cellKind: 'element' });
  cells.push({ row: 5, col: 8, symbolText: 'Mn', cellKind: 'element' });
  cells.push({ row: 5, col: 9, symbolText: 'Fe', cellKind: 'element' });
  cells.push({ row: 5, col: 10, symbolText: 'Co', cellKind: 'element' });
  cells.push({ row: 5, col: 11, symbolText: 'Ni', cellKind: 'element' });
  cells.push({ row: 6, col: 2, symbolText: 'Cu', cellKind: 'element' });
  cells.push({ row: 6, col: 3, symbolText: 'Zn', cellKind: 'element' });
  cells.push({ row: 6, col: 4, symbolText: 'Ga', cellKind: 'element' });
  cells.push({ row: 6, col: 5, symbolText: 'Ge', cellKind: 'element' });
  cells.push({ row: 6, col: 6, symbolText: 'As', cellKind: 'element' });
  cells.push({ row: 6, col: 7, symbolText: 'Se', cellKind: 'element' });
  cells.push({ row: 6, col: 8, symbolText: 'Br', cellKind: 'element' });
  cells.push({ row: 7, col: 1, symbolText: 'Kr', cellKind: 'element' });
  cells.push({ row: 7, col: 2, symbolText: 'Rb', cellKind: 'element' });
  cells.push({ row: 7, col: 3, symbolText: 'Sr', cellKind: 'element' });
  cells.push({ row: 7, col: 4, symbolText: 'Y', cellKind: 'element' });
  cells.push({ row: 7, col: 5, symbolText: 'Zr', cellKind: 'element' });
  cells.push({ row: 7, col: 6, symbolText: 'Nb', cellKind: 'element' });
  cells.push({ row: 7, col: 7, symbolText: 'Mo', cellKind: 'element' });
  cells.push({ row: 7, col: 8, symbolText: 'Tc', cellKind: 'element' });
  cells.push({ row: 7, col: 9, symbolText: 'Ru', cellKind: 'element' });
  cells.push({ row: 7, col: 10, symbolText: 'Rh', cellKind: 'element' });
  cells.push({ row: 7, col: 11, symbolText: 'Pd', cellKind: 'element' });
  cells.push({ row: 8, col: 2, symbolText: 'Ag', cellKind: 'element' });
  cells.push({ row: 8, col: 3, symbolText: 'Cd', cellKind: 'element' });
  cells.push({ row: 8, col: 4, symbolText: 'In', cellKind: 'element' });
  cells.push({ row: 8, col: 5, symbolText: 'Sn', cellKind: 'element' });
  cells.push({ row: 8, col: 6, symbolText: 'Sb', cellKind: 'element' });
  cells.push({ row: 8, col: 7, symbolText: 'Te', cellKind: 'element' });
  cells.push({ row: 8, col: 8, symbolText: 'I', cellKind: 'element' });
  cells.push({ row: 9, col: 1, symbolText: 'Xe', cellKind: 'element' });
  cells.push({ row: 9, col: 2, symbolText: 'Cs', cellKind: 'element' });
  cells.push({ row: 9, col: 3, symbolText: 'Ba', cellKind: 'element' });
  cells.push({ row: 9, col: 4, symbolText: 'La', cellKind: 'element' });
  cells.push({ row: 9, col: 5, symbolText: 'Hf', cellKind: 'element' });
  cells.push({ row: 9, col: 6, symbolText: 'Ta', cellKind: 'element' });
  cells.push({ row: 9, col: 7, symbolText: 'W', cellKind: 'element' });
  cells.push({ row: 9, col: 8, symbolText: 'Re', cellKind: 'element' });
  cells.push({ row: 9, col: 9, symbolText: 'Os', cellKind: 'element' });
  cells.push({ row: 9, col: 10, symbolText: 'Ir', cellKind: 'element' });
  cells.push({ row: 9, col: 11, symbolText: 'Pt', cellKind: 'element' });
  cells.push({ row: 10, col: 2, symbolText: 'Au', cellKind: 'element' });
  cells.push({ row: 10, col: 3, symbolText: 'Hg', cellKind: 'element' });
  cells.push({ row: 10, col: 4, symbolText: 'Tl', cellKind: 'element' });
  cells.push({ row: 10, col: 5, symbolText: 'Pb', cellKind: 'element' });
  cells.push({ row: 10, col: 6, symbolText: 'Bi', cellKind: 'element' });
  cells.push({ row: 10, col: 7, symbolText: 'Po', cellKind: 'element' });
  cells.push({ row: 10, col: 8, symbolText: 'At', cellKind: 'element' });
  cells.push({ row: 11, col: 1, symbolText: 'Rn', cellKind: 'element' });
  cells.push({ row: 11, col: 2, symbolText: 'Fr', cellKind: 'element' });
  cells.push({ row: 11, col: 3, symbolText: 'Ra', cellKind: 'element' });
  cells.push({ row: 11, col: 4, symbolText: 'Ac', cellKind: 'element' });
  cells.push({ row: 11, col: 5, symbolText: 'Th', cellKind: 'element' });
  cells.push({ row: 11, col: 6, symbolText: 'Pa', cellKind: 'element' });
  cells.push({ row: 11, col: 7, symbolText: 'U', cellKind: 'element' });

  return {
    id: 'mendeleev' as const,
    rows: 11,
    cols: 11,
    columnTemplate: 'repeat(11, var(--table-cell-size, 56px))',
    cells,
  };
})();

const newlandSpec = (() => {
  const cells: HistoricalCell[] = [];

  cells.push({ row: 1, col: 1, symbolText: 'sa (do)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 2, symbolText: 're (re)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 3, symbolText: 'ga (mi)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 4, symbolText: 'ma (fa)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 5, symbolText: 'pa (so)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 6, symbolText: 'dha (la)', cellKind: 'headerNote' });
  cells.push({ row: 1, col: 7, symbolText: 'ni (ti)', cellKind: 'headerNote' });
  cells.push({ row: 2, col: 1, symbolText: 'H', cellKind: 'element' });
  cells.push({ row: 2, col: 2, symbolText: 'Li', cellKind: 'element' });
  cells.push({ row: 2, col: 3, symbolText: 'Be', cellKind: 'element' });
  cells.push({ row: 2, col: 4, symbolText: 'B', cellKind: 'element' });
  cells.push({ row: 2, col: 5, symbolText: 'C', cellKind: 'element' });
  cells.push({ row: 2, col: 6, symbolText: 'N', cellKind: 'element' });
  cells.push({ row: 2, col: 7, symbolText: 'O', cellKind: 'element' });
  cells.push({ row: 3, col: 1, symbolText: 'F', cellKind: 'element' });
  cells.push({ row: 3, col: 2, symbolText: 'Na', cellKind: 'element' });
  cells.push({ row: 3, col: 3, symbolText: 'Mg', cellKind: 'element' });
  cells.push({ row: 3, col: 4, symbolText: 'Al', cellKind: 'element' });
  cells.push({ row: 3, col: 5, symbolText: 'Si', cellKind: 'element' });
  cells.push({ row: 3, col: 6, symbolText: 'P', cellKind: 'element' });
  cells.push({ row: 3, col: 7, symbolText: 'S', cellKind: 'element' });
  cells.push({ row: 4, col: 1, symbolText: 'Cl', cellKind: 'element' });
  cells.push({ row: 4, col: 2, symbolText: 'K', cellKind: 'element' });
  cells.push({ row: 4, col: 3, symbolText: 'Ca', cellKind: 'element' });
  cells.push({ row: 4, col: 4, symbolText: 'Cr', cellKind: 'element' });
  cells.push({ row: 4, col: 5, symbolText: 'Ti', cellKind: 'element' });
  cells.push({ row: 4, col: 6, symbolText: 'Mn', cellKind: 'element' });
  cells.push({ row: 4, col: 7, symbolText: 'Fe', cellKind: 'element' });
  cells.push({ row: 5, col: 1, symbolText: 'Co/Ni', cellKind: 'composite' });
  cells.push({ row: 5, col: 2, symbolText: 'Cu', cellKind: 'element' });
  cells.push({ row: 5, col: 3, symbolText: 'Zn', cellKind: 'element' });
  cells.push({ row: 5, col: 4, symbolText: 'Y', cellKind: 'element' });
  cells.push({ row: 5, col: 5, symbolText: 'In', cellKind: 'element' });
  cells.push({ row: 5, col: 6, symbolText: 'As', cellKind: 'element' });
  cells.push({ row: 5, col: 7, symbolText: 'Se', cellKind: 'element' });
  cells.push({ row: 6, col: 1, symbolText: 'Br', cellKind: 'element' });
  cells.push({ row: 6, col: 2, symbolText: 'Rb', cellKind: 'element' });
  cells.push({ row: 6, col: 3, symbolText: 'Sr', cellKind: 'element' });
  cells.push({ row: 6, col: 4, symbolText: 'Ce/La', cellKind: 'composite' });
  cells.push({ row: 6, col: 5, symbolText: 'Zr', cellKind: 'element' });
  cells.push({ row: 6, col: 6, symbolText: 'Di/Mo', cellKind: 'composite' });
  cells.push({ row: 6, col: 7, symbolText: 'Ro/Ru', cellKind: 'composite' });
  cells.push({ row: 7, col: 1, symbolText: 'Pd', cellKind: 'element' });
  cells.push({ row: 7, col: 2, symbolText: 'Ag', cellKind: 'element' });
  cells.push({ row: 7, col: 3, symbolText: 'Cd', cellKind: 'element' });
  cells.push({ row: 7, col: 4, symbolText: 'U', cellKind: 'element' });
  cells.push({ row: 7, col: 5, symbolText: 'Sn', cellKind: 'element' });
  cells.push({ row: 7, col: 6, symbolText: 'Sb', cellKind: 'element' });
  cells.push({ row: 7, col: 7, symbolText: 'Te', cellKind: 'element' });
  cells.push({ row: 8, col: 1, symbolText: 'I', cellKind: 'element' });
  cells.push({ row: 8, col: 2, symbolText: 'Cs', cellKind: 'element' });
  cells.push({ row: 8, col: 3, symbolText: 'Ba/V', cellKind: 'composite' });
  cells.push({ row: 8, col: 4, symbolText: 'Ta', cellKind: 'element' });
  cells.push({ row: 8, col: 5, symbolText: 'W', cellKind: 'element' });
  cells.push({ row: 8, col: 6, symbolText: 'Nb', cellKind: 'element' });
  cells.push({ row: 8, col: 7, symbolText: 'Au', cellKind: 'element' });
  cells.push({ row: 9, col: 1, symbolText: 'Pt/Ir', cellKind: 'composite' });
  cells.push({ row: 9, col: 2, symbolText: 'Tl', cellKind: 'element' });
  cells.push({ row: 9, col: 3, symbolText: 'Pb', cellKind: 'element' });
  cells.push({ row: 9, col: 4, symbolText: 'Th', cellKind: 'element' });
  cells.push({ row: 9, col: 5, symbolText: 'Hg', cellKind: 'element' });
  cells.push({ row: 9, col: 6, symbolText: 'Bi', cellKind: 'element' });
  cells.push({ row: 9, col: 7, symbolText: 'Os', cellKind: 'element' });

  return {
    id: 'newland' as const,
    rows: 9,
    cols: 7,
    columnTemplate: 'repeat(7, var(--table-cell-size, 56px))',
    cells,
  };
})();

export const HISTORICAL_TABLES: Record<HistoricalTableMode, HistoricalTableSpec> = {
  mendeleev: mendeleevSpec,
  newland: newlandSpec,
};
