import { ElementData } from '../../types';

export type Table3DMode =
  | 'grid3D'
  | 'helix'
  | 'sphere'
  | 'cylinder'
  | 'block3D'
  | 'orbital';

export interface Position3D {
  x: number;
  y: number;
  z: number;
  rotation?: [number, number, number];
}

export interface Layout3DResult {
  positions: Map<number, Position3D>;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
}

export type LayoutEngine3D = (elements: ElementData[]) => Layout3DResult;

export interface Layout3DMeta {
  id: Table3DMode;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export const LAYOUT_3D_META: Record<Table3DMode, Layout3DMeta> = {
  grid3D: {
    id: 'grid3D',
    name: '3D Grid (Layered)',
    shortName: 'Grid',
    description: 'Layered periodic table with depth by orbital block',
    icon: '🧊',
  },
  helix: {
    id: 'helix',
    name: 'Helical Spiral',
    shortName: 'Helix',
    description: 'Elements spiral upward by atomic number',
    icon: '🧬',
  },
  sphere: {
    id: 'sphere',
    name: 'Spherical Globe',
    shortName: 'Sphere',
    description: 'Elements mapped onto a sphere surface',
    icon: '🌍',
  },
  cylinder: {
    id: 'cylinder',
    name: 'Cylindrical Wrap',
    shortName: 'Cylinder',
    description: 'Periodic table wrapped around a cylinder',
    icon: '🧯',
  },
  block3D: {
    id: 'block3D',
    name: '3D Block Structure',
    shortName: 'Blocks',
    description: 'Orbital blocks as floating 3D clusters',
    icon: '🧱',
  },
  orbital: {
    id: 'orbital',
    name: 'Orbital Cloud',
    shortName: 'Orbital',
    description: 'Elements positioned by quantum numbers',
    icon: '⚛️',
  },
};

export const ALL_3D_MODES: Table3DMode[] = [
  'grid3D', 'helix', 'sphere', 'cylinder', 'block3D', 'orbital',
];
