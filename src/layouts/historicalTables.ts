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

  const headers = [
    'Group / Series',
    'Series I',
    'Series II',
    'Series III',
    'Series IV',
    'Series V',
    'Series VI',
    'Series VII',
    'Series VIII',
    'Series IX',
    'Series X',
    'Series XI',
  ];

  headers.forEach((header, idx) => {
    cells.push({
      row: 1,
      col: idx + 1,
      symbolText: header,
      cellKind: 'header',
    });
  });

  const rows: Array<
    | {
        rowLabel: string;
        series: Array<RowCellSeed | null>;
      }
    | {
        annexHeader: string;
      }
  > = [
    { rowLabel: '— H —', series: [seed('H', '1'), null, null, null, null, null, null, null, null, null, null] },
    { rowLabel: 'Ti · Zr group', series: [null, null, null, null, null, null, seed('Ti', '50', 'element', 'heavy'), seed('Zr', '90', 'element', 'heavy'), null, null, seed('?', '180', 'predicted')] },
    { rowLabel: 'V · Nb · Ta group', series: [null, null, null, null, null, null, seed('V', '51', 'element', 'heavy'), seed('Nb', '94', 'element', 'heavy'), null, null, seed('Ta', '182', 'element', 'heavy')] },
    { rowLabel: 'Cr · Mo · W group', series: [null, null, null, null, null, null, seed('Cr', '52', 'element', 'heavy'), seed('Mo', '96', 'element', 'heavy'), null, null, seed('W', '186', 'element', 'heavy')] },
    { rowLabel: 'Mn · Rh · Pt group', series: [null, null, null, null, null, null, seed('Mn', '55', 'element', 'heavy'), seed('Rh', '104.4', 'element', 'anomaly'), null, null, seed('Pt', '197.4', 'element', 'anomaly')] },
    { rowLabel: 'Fe · Ru · Ir group', series: [null, null, null, null, null, null, seed('Fe', '56', 'element', 'heavy'), seed('Ru', '104.4', 'element', 'heavy'), null, null, seed('Ir', '198', 'element', 'heavy')] },
    { rowLabel: 'Ni=Co · Pd · Os group', series: [null, null, null, null, null, null, seed('Ni=Co', '59', 'composite', 'anomaly'), seed('Pd', '106.6', 'element', 'heavy'), null, null, seed('Os', '199', 'element', 'heavy')] },
    { rowLabel: 'H · Cu · Ag · Hg (Group I)', series: [seed('H', '1'), null, null, null, null, null, seed('Cu', '63.4'), null, null, seed('Ag', '108'), seed('Hg', '200')] },
    { rowLabel: 'Be · Mg · Zn · Cd (Group II)', series: [null, seed('Be', '9.4'), null, seed('Mg', '24'), null, null, seed('Zn', '65.2'), null, null, seed('Cd', '112'), null] },
    { rowLabel: 'B · Al · ?=68 · Ur · Au (Group III)', series: [null, seed('B', '11'), null, seed('Al', '27.4'), null, null, seed('?', '68', 'predicted'), null, null, seed('Ur', '116?', 'archaic', 'anomaly'), seed('Au', '197?', 'element', 'anomaly')] },
    { rowLabel: 'C · Si · ?=70 · Sn (Group IV)', series: [null, seed('C', '12'), null, seed('Si', '28'), null, null, seed('?', '70', 'predicted'), null, null, seed('Sn', '118'), null] },
    { rowLabel: 'N · P · As · Sb · Bi (Group V)', series: [null, seed('N', '14'), null, seed('P', '31'), null, seed('As', '75'), null, null, seed('Sb', '122'), null, seed('Bi', '210?')] },
    { rowLabel: 'O · S · Se · Te (Group VI)', series: [null, seed('O', '16'), null, seed('S', '32'), null, seed('Se', '79.4'), null, null, seed('Te', '128?', 'element', 'anomaly'), null, null] },
    { rowLabel: 'F · Cl · Br · J (Group VII)', series: [null, seed('F', '19'), null, seed('Cl', '35.5'), null, seed('Br', '80'), null, null, seed('J', '127', 'archaic'), null, null] },
    { rowLabel: 'Li · Na · K · Rb · Cs · Tl (Alkali)', series: [seed('Li', '7'), null, seed('Na', '23'), null, seed('K', '39'), null, seed('Rb', '85.4'), null, seed('Cs', '133'), null, seed('Tl', '204', 'element', 'anomaly')] },
    { rowLabel: 'Ca · Sr · Ba · Pb (Alkaline Earth)', series: [null, null, null, seed('Ca', '40'), null, seed('Sr', '87.6'), null, seed('Ba', '137'), null, null, seed('Pb', '207', 'element', 'anomaly')] },
    { annexHeader: 'Rare Earths & Uncertainly Placed Elements — Mendeleev conceded these did not fit the system and grouped them separately' },
    { rowLabel: '?=45 · Ce group', series: [null, null, null, null, null, null, seed('?', '45', 'predicted'), seed('Ce', '92', 'element', 'anomaly'), null, null, null] },
    { rowLabel: '?Er · La group', series: [null, null, null, null, null, null, seed('?Er', '56', 'archaic', 'anomaly'), seed('La', '94', 'element', 'anomaly'), null, null, null] },
    { rowLabel: '?Yt · Di group', series: [null, null, null, null, null, null, seed('?Yt', '60', 'archaic', 'anomaly'), seed('Di', '95', 'archaic', 'anomaly'), null, null, null] },
    { rowLabel: '?In · Th group', series: [null, null, null, null, null, null, seed('?In', '75.6', 'archaic', 'anomaly'), seed('Th', '118?', 'element', 'anomaly'), null, null, null] },
  ];

  rows.forEach((row, idx) => {
    const tableRow = idx + 2;
    if ('annexHeader' in row) {
      cells.push({
        row: tableRow,
        col: 1,
        colSpan: 12,
        symbolText: row.annexHeader,
        cellKind: 'annexHeader',
      });
      return;
    }

    cells.push({
      row: tableRow,
      col: 1,
      symbolText: row.rowLabel,
      cellKind: 'rowHeader',
    });

    row.series.forEach((seriesCell, seriesIdx) => {
      if (!seriesCell) return;
      cells.push({
        row: tableRow,
        col: seriesIdx + 2,
        symbolText: seriesCell.symbolText,
        subText: seriesCell.subText,
        cellKind: seriesCell.cellKind || 'element',
        emphasis: seriesCell.emphasis,
      });
    });
  });

  return {
    id: 'mendeleev' as const,
    rows: 22,
    cols: 12,
    columnTemplate:
      'clamp(170px, calc(var(--table-cell-size, 56px) * 2.8), 320px) repeat(11, var(--table-cell-size, 56px))',
    cells,
  };
})();

const newlandSpec = (() => {
  const cells: HistoricalCell[] = [];
  const noteHeaders = ['Do (I)', 'Re (II)', 'Mi (III)', 'Fa (IV)', 'Sol (V)', 'La (VI)', 'Ti (VII)', 'Do′ (VIII)'];
  const rowNo = ['No.', 'No.', 'No.', 'No.', 'No.', 'No.', 'No.', 'No.'];

  noteHeaders.forEach((text, idx) => {
    cells.push({
      row: 1,
      col: idx + 1,
      symbolText: text,
      cellKind: 'headerNote',
    });
  });

  rowNo.forEach((text, idx) => {
    cells.push({
      row: 2,
      col: idx + 1,
      symbolText: text,
      cellKind: 'header',
    });
  });

  const rows: Array<Array<RowCellSeed>> = [
    [seed('H', '1'), seed('F', '8'), seed('Cl', '15'), seed('Co & Ni', '22', 'composite'), seed('Br', '29'), seed('Pd', '36'), seed('I', '42'), seed('Pt & Ir', '50', 'composite')],
    [seed('Li', '2'), seed('Na', '9'), seed('K', '16'), seed('Cu', '23'), seed('Rb', '30'), seed('Ag', '37'), seed('Cs', '44'), seed('Tl', '53')],
    [seed('G', '3', 'archaic'), seed('Mg', '10'), seed('Ca', '17'), seed('Zn', '25'), seed('Sr', '31'), seed('Cd', '38'), seed('Ba & V', '45', 'composite'), seed('Pb', '54')],
    [seed('Bo', '4', 'archaic'), seed('Al', '11'), seed('Cr', '19'), seed('Y', '24'), seed('Ce & La', '33', 'composite'), seed('U', '40'), seed('Ta', '46'), seed('Th', '56')],
    [seed('C', '5'), seed('Si', '12'), seed('Ti', '18'), seed('In', '26'), seed('Zr', '32'), seed('Sn', '39'), seed('W', '47'), seed('Hg', '52')],
    [seed('N', '6'), seed('P', '13'), seed('Mn', '20'), seed('As', '27'), seed('Di & Mo', '34', 'composite'), seed('Sb', '41'), seed('Nb', '48'), seed('Bi', '55')],
    [seed('O', '7'), seed('S', '14'), seed('Fe', '21'), seed('Se', '28'), seed('Ro & Ru', '35', 'composite'), seed('Te', '43'), seed('Au', '49'), seed('Os', '51')],
  ];

  rows.forEach((row, rowIdx) => {
    const tableRow = rowIdx + 3;
    row.forEach((cell, colIdx) => {
      cells.push({
        row: tableRow,
        col: colIdx + 1,
        symbolText: cell.symbolText,
        subText: cell.subText,
        cellKind: cell.cellKind || 'element',
      });
    });
  });

  return {
    id: 'newland' as const,
    rows: 9,
    cols: 8,
    columnTemplate: 'repeat(8, var(--table-cell-size, 56px))',
    cells,
  };
})();

export const HISTORICAL_TABLES: Record<HistoricalTableMode, HistoricalTableSpec> = {
  mendeleev: mendeleevSpec,
  newland: newlandSpec,
};
