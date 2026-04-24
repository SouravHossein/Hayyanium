import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Circular / Radial periodic table.
 * Periods = concentric rings, Groups = angular sectors.
 */
export const circularLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const size = 900;
  const cx = size / 2;
  const cy = size / 2;
  const ringSpacing = 50;
  const cellSize = 25;

  elements.forEach((el) => {
    let period = el.period;
    let groupAngle: number;
    let logicalGroup: number;

    if (el.category === 'lanthanide') {
      const idx = el.atomicNumber - 57; // 0 to 14
      logicalGroup = 3 + idx;
    } else if (el.category === 'actinide') {
      const idx = el.atomicNumber - 89; // 0 to 14
      logicalGroup = 3 + idx;
    } else {
      if (el.group <= 2) {
        logicalGroup = el.group;
      } else if (el.group === 3) {
        logicalGroup = 17; // Align Sc and Y above Lu and Lr
      } else {
        // Group >= 4 shift outward by 14 blocks to make room for f-block
        logicalGroup = 14 + el.group;
      }
    }

    // Spread 32 logical groups over full circle, starting from top and flowing LEFT
    groupAngle = -(((logicalGroup - 1) / 32) * Math.PI * 2) - Math.PI / 2;

    const r = period * ringSpacing;
    const x = cx + r * Math.cos(groupAngle) - cellSize / 2;
    const y = cy + r * Math.sin(groupAngle) - cellSize / 2;

    positions.set(el.atomicNumber, { x, y, w: cellSize, h: cellSize });
  });

  return {
    positions,
    containerWidth: size,
    containerHeight: size,
  };
};
