import { ElementData } from '../types';

export type TableMode =
  | 'modern'
  | 'mendeleev'
  | 'leftStep'
  | 'compact'
  | 'triangular'
  | 'circular'
  | 'spiral'
  | 'ribbon'
  | 'block';

export type RenderType = 'grid' | 'spatial';

export interface LayoutPosition {
  x: number;
  y: number;
  w?: number; // cell width for spatial
  h?: number; // cell height for spatial
}

export interface LayoutResult {
  positions: Map<number, LayoutPosition>; // keyed by atomicNumber
  gridCols?: number;
  gridRows?: number;
  containerWidth?: number;   // for spatial modes
  containerHeight?: number;  // for spatial modes
  labels?: { text: string; x: number; y: number; type: 'group' | 'period' | 'block' }[];
  gaps?: LayoutPosition[];   // ghost/placeholder cells (Mendeleev gaps)
}

export interface LayoutMeta {
  id: TableMode;
  name: string;
  shortName: string;
  description: string;
  icon: string; // emoji
  renderType: RenderType;
  themeClass?: string; // extra CSS class for theming
}

export type LayoutEngine = (elements: ElementData[]) => LayoutResult;

// ─── All layout metadata ───────────────────────────────────────────────
export const LAYOUT_META: Record<TableMode, LayoutMeta> = {
  modern: {
    id: 'modern',
    name: 'Modern (IUPAC)',
    shortName: 'Modern',
    description: '18-column standard periodic table',
    icon: '🔷',
    renderType: 'grid',
  },
  mendeleev: {
    id: 'mendeleev',
    name: 'Mendeleev (1869)',
    shortName: 'Mendeleev',
    description: '8-column historical layout with predicted gaps',
    icon: '🧱',
    renderType: 'grid',
    themeClass: 'mendeleev-theme',
  },
  leftStep: {
    id: 'leftStep',
    name: 'Left-Step (Janet)',
    shortName: 'Left-Step',
    description: 'Quantum-based orbital filling order',
    icon: '🧠',
    renderType: 'grid',
    themeClass: 'leftstep-theme',
  },
  compact: {
    id: 'compact',
    name: 'Compact (School)',
    shortName: 'Compact',
    description: '8-column beginner-friendly layout',
    icon: '📦',
    renderType: 'grid',
  },
  triangular: {
    id: 'triangular',
    name: 'Triangular',
    shortName: 'Triangle',
    description: 'Triangular offset grid layout',
    icon: '🔺',
    renderType: 'spatial',
  },
  circular: {
    id: 'circular',
    name: 'Circular (Radial)',
    shortName: 'Circular',
    description: 'Periods as rings, groups as sectors',
    icon: '🟠',
    renderType: 'spatial',
  },
  spiral: {
    id: 'spiral',
    name: 'Spiral (Benfey)',
    shortName: 'Spiral',
    description: 'Continuous spiral by atomic number',
    icon: '🌀',
    renderType: 'spatial',
  },
  ribbon: {
    id: 'ribbon',
    name: 'Ribbon (Continuous)',
    shortName: 'Ribbon',
    description: 'Continuous horizontal strip',
    icon: '🧵',
    renderType: 'grid',
  },
  block: {
    id: 'block',
    name: 'Block (Orbital)',
    shortName: 'Block',
    description: 'Separated s/p/d/f block sections',
    icon: '🧩',
    renderType: 'grid',
  },
};

export const ALL_MODES: TableMode[] = [
  'modern', 'mendeleev', 'leftStep', 'compact',
  'triangular', 'circular', 'spiral',
  'ribbon', 'block',
];
