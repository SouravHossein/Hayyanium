import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Helical Periodic Table — elements spiral upward by atomic number.
 * The showstopper layout.
 */
export const helixLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const radius = 18;
  const verticalSpacing = 1.2;
  const angularStep = 0.34; // ~18 elements per full revolution

  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);
  const midZ = (sorted.length * verticalSpacing) / 2;

  sorted.forEach((el) => {
    const theta = el.atomicNumber * angularStep;
    positions.set(el.atomicNumber, {
      x: radius * Math.cos(theta),
      z: radius * Math.sin(theta),
      y: el.atomicNumber * verticalSpacing - midZ,
    });
  });

  return {
    positions,
    cameraPosition: [35, 15, 35],
    cameraTarget: [0, 0, 0],
  };
};
