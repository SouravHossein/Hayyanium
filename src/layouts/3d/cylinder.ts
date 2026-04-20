import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Cylindrical periodic table — wrapped around a vertical cylinder.
 * Height = period, Angle = group.
 */
export const cylinderLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const radius = 22;
  const heightSpacing = 5;

  elements.forEach((el) => {
    let theta: number, y: number;

    if (el.category === 'lanthanide') {
      const idx = el.atomicNumber - 57;
      theta = ((idx / 15) * 0.8 + 0.1) * 2 * Math.PI;
      y = -6.5 * heightSpacing;
    } else if (el.category === 'actinide') {
      const idx = el.atomicNumber - 89;
      theta = ((idx / 15) * 0.8 + 0.1) * 2 * Math.PI;
      y = -7.5 * heightSpacing;
    } else {
      theta = ((el.group - 1) / 18) * 2 * Math.PI;
      y = -el.period * heightSpacing;
    }

    positions.set(el.atomicNumber, {
      x: radius * Math.cos(theta),
      z: radius * Math.sin(theta),
      y: y + 4 * heightSpacing,
    });
  });

  return {
    positions,
    cameraPosition: [40, 10, 40],
    cameraTarget: [0, -5, 0],
  };
};
