import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Spherical periodic table — elements on a sphere.
 * Latitude = period, Longitude = group.
 */
export const sphereLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const radius = 28;

  elements.forEach((el) => {
    let phi: number, theta: number;

    if (el.category === 'lanthanide') {
      const idx = el.atomicNumber - 57;
      phi = (6.5 / 8) * Math.PI;
      theta = ((idx / 15) * 0.5 + 0.1) * 2 * Math.PI;
    } else if (el.category === 'actinide') {
      const idx = el.atomicNumber - 89;
      phi = (7.5 / 8) * Math.PI;
      theta = ((idx / 15) * 0.5 + 0.1) * 2 * Math.PI;
    } else {
      // period → latitude (phi), group → longitude (theta)
      phi = ((el.period - 0.5) / 7.5) * Math.PI;
      theta = ((el.group - 1) / 18) * 2 * Math.PI;
    }

    positions.set(el.atomicNumber, {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta),
    });
  });

  return {
    positions,
    cameraPosition: [0, 15, 50],
    cameraTarget: [0, 0, 0],
  };
};
