import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * 3D Block Structure — orbital blocks as floating clusters.
 * s, p, d, f each get their own spatial region.
 */
const BLOCK_OFFSET: Record<string, [number, number, number]> = {
  s: [20, 0, 0],
  p: [10, 0, -15],
  d: [-10, 0, 0],
  f: [-10, 0, 15],
};

export const block3DLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const spacing = 2.25;

  // Group by block
  const blocks = new Map<string, ElementData[]>();
  elements.forEach((el) => {
    const b = el.block || 's';
    if (!blocks.has(b)) blocks.set(b, []);
    blocks.get(b)!.push(el);
  });

  blocks.forEach((els, block) => {
    const offset = BLOCK_OFFSET[block] || [0, 0, 0];
    const sorted = [...els].sort((a, b) => a.atomicNumber - b.atomicNumber);

    // Arrange in a mini-grid within the block
    const cols = block === 'f' ? 14 : block === 'd' ? 10 : block === 'p' ? 6 : 2;

    sorted.forEach((el, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      positions.set(el.atomicNumber, {
        x: offset[0] + (col - cols / 2) * spacing,
        y: offset[1] - row * spacing,
        z: offset[2],
      });
    });
  });

  return {
    positions,
    cameraPosition: [0, 10, 50],
    cameraTarget: [0, -5, 0],
  };
};
