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
  const ringSpacing = 55;
  const cellSize = 42;

  elements.forEach((el) => {
    // Use period for radius, group for angle
    let period = el.period;
    let groupAngle: number;

    if (el.category === 'lanthanide') {
      period = 8.2;
      const idx = el.atomicNumber - 57;
      groupAngle = ((idx / 15) * 0.5 + 0.15) * Math.PI * 2;
    } else if (el.category === 'actinide') {
      period = 9.2;
      const idx = el.atomicNumber - 89;
      groupAngle = ((idx / 15) * 0.5 + 0.15) * Math.PI * 2;
    } else {
      // Spread 18 groups over full circle, starting from top
      groupAngle = ((el.group - 1) / 18) * Math.PI * 2 - Math.PI / 2;
    }

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
