import { Table3DMode, LayoutEngine3D, LAYOUT_3D_META, Layout3DMeta } from './types';
import { grid3DLayout } from './grid3d';
import { helixLayout } from './helix';
import { sphereLayout } from './sphere';
import { cylinderLayout } from './cylinder';
import { block3DLayout } from './block3d';
import { orbitalLayout } from './orbital';

const ENGINES_3D: Record<Table3DMode, LayoutEngine3D> = {
  grid3D: grid3DLayout,
  helix: helixLayout,
  sphere: sphereLayout,
  cylinder: cylinderLayout,
  block3D: block3DLayout,
  orbital: orbitalLayout,
};

export function get3DLayoutEngine(mode: Table3DMode): LayoutEngine3D {
  return ENGINES_3D[mode];
}

export function get3DLayoutMeta(mode: Table3DMode): Layout3DMeta {
  return LAYOUT_3D_META[mode];
}

export { LAYOUT_3D_META, ALL_3D_MODES } from './types';
export type { Table3DMode, LayoutEngine3D, Layout3DResult, Position3D } from './types';
