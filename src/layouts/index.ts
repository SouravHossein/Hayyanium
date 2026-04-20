import { TableMode, LayoutEngine, LAYOUT_META, LayoutMeta } from './types';
import { modernLayout } from './modern';
import { mendeleevLayout } from './mendeleev';
import { leftStepLayout } from './leftStep';
import { compactLayout } from './compact';
import { circularLayout } from './circular';
import { spiralLayout } from './spiral';
import { triangularLayout } from './triangular';
import { ribbonLayout } from './ribbon';
import { blockLayout } from './block';

const ENGINES: Record<TableMode, LayoutEngine> = {
  modern: modernLayout,
  mendeleev: mendeleevLayout,
  leftStep: leftStepLayout,
  compact: compactLayout,
  circular: circularLayout,
  spiral: spiralLayout,
  triangular: triangularLayout,
  ribbon: ribbonLayout,
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
