import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Helical Periodic Table — elements spiral upward by atomic number.
 * The showstopper layout.
 */
export const helixLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const radius = 15; // Reduced from 18
  const verticalSpacing = 1.0; // Reduced from 1.2
  const angularStep = 0.35; // Slightly adjusted

  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);
  const midY = (sorted.length * verticalSpacing) / 2;

  sorted.forEach((el) => {
    const theta = el.atomicNumber * angularStep;
    positions.set(el.atomicNumber, {
      x: radius * Math.cos(theta),
      z: radius * Math.sin(theta),
      y: el.atomicNumber * verticalSpacing - midY,
      // Rotate around Y to face outward
      rotation: [0, -theta - Math.PI / 2, 0],
    });
  });

  return {
    positions,
    cameraPosition: [30, 0, 30],
    cameraTarget: [0, 0, 0],
  };
};
