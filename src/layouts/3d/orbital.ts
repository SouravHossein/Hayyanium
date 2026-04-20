import { ElementData } from '../../types';
import { LayoutEngine3D, Layout3DResult, Position3D } from './types';

/**
 * Orbital Cloud — elements positioned by quantum numbers.
 * n (principal) = radius layer, l (angular momentum) = vertical offset,
 * m (magnetic) = angular position.
 */

// Extract principal quantum number from period
function getN(el: ElementData): number {
  return el.period;
}

// Angular momentum quantum number from block
function getL(el: ElementData): number {
  if (el.block === 's') return 0;
  if (el.block === 'p') return 1;
  if (el.block === 'd') return 2;
  if (el.block === 'f') return 3;
  return 0;
}

export const orbitalLayout: LayoutEngine3D = (elements: ElementData[]): Layout3DResult => {
  const positions = new Map<number, Position3D>();
  const radiusScale = 4.5;
  const heightScale = 3.2;

  elements.forEach((el) => {
    const n = getN(el);
    const l = getL(el);

    // Base radius from principal quantum number
    const r = n * radiusScale;

    // Angle along the orbital — spread elements within their subshell
    let angularIndex: number;
    let angularTotal: number;

    if (el.block === 's') {
      angularIndex = el.group === 1 ? 0 : 1;
      angularTotal = 2;
    } else if (el.block === 'p') {
      angularIndex = el.group - 13;
      angularTotal = 6;
    } else if (el.block === 'd') {
      angularIndex = el.group - 3;
      angularTotal = 10;
    } else {
      // f-block
      if (el.category === 'lanthanide') {
        angularIndex = el.atomicNumber - 57;
      } else {
        angularIndex = el.atomicNumber - 89;
      }
      angularTotal = 14;
    }

    const theta = ((angularIndex + 0.5) / angularTotal) * 2 * Math.PI;

    // Height offset by angular momentum
    const y = -l * heightScale + (n - 4) * heightScale * 0.5;
    
    const posX = r * Math.cos(theta);
    const posZ = r * Math.sin(theta);
    const posY = y;
    
    // Calculate rotation to face outward from center
    const dist = Math.sqrt(posX * posX + posY * posY + posZ * posZ);
    const phi = Math.acos(posY / dist);
    const azimuthal = Math.atan2(posZ, posX);

    positions.set(el.atomicNumber, {
      x: posX,
      y: posY,
      z: posZ,
      rotation: [phi - Math.PI / 2, -azimuthal - Math.PI / 2, 0],
    });
  });

  return {
    positions,
    cameraPosition: [0, 15, 45],
    cameraTarget: [0, 0, 0],
  };
};
