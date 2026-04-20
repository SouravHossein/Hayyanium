import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * 3D Grid: Standard periodic table extended into depth.
 * x = group, y = -period (inverted so period 1 is at top), z = block depth.
 */
const BLOCK_DEPTH: Record<string, number> = { s: 0, p: 2, d: 4, f: 6 };

export const grid3DLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const spacing = 2.2;

  elements.forEach((el) => {
    let x: number, y: number, z: number;

    if (el.category === 'lanthanide') {
      x = (el.atomicNumber - 57 + 3) * spacing;
      y = -8 * spacing;
      z = (BLOCK_DEPTH[el.block] || 0) * spacing * 0.5;
    } else if (el.category === 'actinide') {
      x = (el.atomicNumber - 89 + 3) * spacing;
      y = -9 * spacing;
      z = (BLOCK_DEPTH[el.block] || 0) * spacing * 0.5;
    } else {
      x = el.group * spacing;
      y = -el.period * spacing;
      z = (BLOCK_DEPTH[el.block] || 0) * spacing * 0.5;
    }

    positions.set(el.atomicNumber, { x: x - 9 * spacing, y: y + 5 * spacing, z });
  });

  return {
    positions,
    cameraPosition: [0, 5, 45],
    cameraTarget: [0, 0, 0],
  };
};
