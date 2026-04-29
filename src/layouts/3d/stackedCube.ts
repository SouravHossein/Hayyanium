import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Stacked cube table:
 * - Base table keeps classic 2D periodic-table structure (x/y).
 * - Lanthanides (57-71) are stacked on Lanthanum's slot along +Z.
 * - Actinides (89-103) are stacked on Actinium's slot along +Z.
 */
export const stackedCubeLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const spacing = 2.5;
  const stackSpacing = 2;

  const byAtomicNumber = new Map<number, ElementData>();
  for (const el of elements) {
    byAtomicNumber.set(el.atomicNumber, el);
  }

  const la = byAtomicNumber.get(57);
  const ac = byAtomicNumber.get(89);

  const laAnchorX = ((la?.xpos ?? 3) - 9.5) * spacing;
  const laAnchorY = (7 - (la?.ypos ?? 6)) * spacing;
  const acAnchorX = ((ac?.xpos ?? 3) - 9.5) * spacing;
  const acAnchorY = (7 - (ac?.ypos ?? 7)) * spacing;

  for (const el of elements) {
    if (el.category === 'lanthanide') {
      const stackIndex = el.atomicNumber - 57; // La..Lu => 0..14
      positions.set(el.atomicNumber, {
        x: laAnchorX,
        y: laAnchorY,
        z: stackIndex * stackSpacing,
      });
      continue;
    }

    if (el.category === 'actinide') {
      const stackIndex = el.atomicNumber - 89; // Ac..Lr => 0..14
      positions.set(el.atomicNumber, {
        x: acAnchorX,
        y: acAnchorY,
        z: stackIndex * stackSpacing,
      });
      continue;
    }

    positions.set(el.atomicNumber, {
      x: (el.xpos - 9.5) * spacing,
      y: (5 - el.ypos) * spacing,
      z: 0,
    });
  }

  return {
    positions,
    cameraPosition: [0, 4, 58],
    cameraTarget: [0, 0, 9],
  };
};
