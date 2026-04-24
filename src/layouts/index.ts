import { TableMode, LayoutEngine, LAYOUT_META, LayoutMeta } from './types';
import { modernLayout } from './modern';
import { mendeleevLayout } from './mendeleev';
import { newlandLayout } from './newland';
import { leftStepLayout } from './leftStep';
import { circularLayout } from './circular';
import { triangularLayout } from './triangular';
import { blockLayout } from './block';

const ENGINES: Record<TableMode, LayoutEngine> = {
  modern: modernLayout,
  mendeleev: mendeleevLayout,
  newland: newlandLayout,
  leftStep: leftStepLayout,
  circular: circularLayout,
  triangular: triangularLayout,
  block: blockLayout,
};

export function getLayoutEngine(mode: TableMode): LayoutEngine {
  return ENGINES[mode];
}

export function getLayoutMeta(mode: TableMode): LayoutMeta {
  return LAYOUT_META[mode];
}

export { LAYOUT_META, type TableMode, type LayoutEngine } from './types';
export { ALL_MODES } from './types';
