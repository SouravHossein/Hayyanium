import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Circular / Radial periodic table.
 * Periods = concentric rings, Groups = angular sectors.
 */
export const circularLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const canvasPadding = 220;
  const size = 900 + canvasPadding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const ringSpacing = 50;
  const cellSize = 25;
  const totalSlots = 32;

  const slotWeights = Array.from({ length: totalSlots }, (_, index) => {
    const slot = index + 1;

    if (slot === 1 || slot === 32) return 1.95;
    if (slot === 2 || slot === 31) return 1.15;
    if (slot >= 3 && slot <= 17) return 0.42; // f-block compression + group 3 anchor
    if (slot >= 18 && slot <= 26) return 0.6; // d-block compression
    if (slot >= 27 && slot <= 30) return 1.12;
    return 1.32; // groups 13-18 get more breathing room overall
  });

  const totalWeight = slotWeights.reduce((sum, weight) => sum + weight, 0);
  const slotAngles = new Map<number, number>();
  let runningWeight = 0;

  slotWeights.forEach((weight, index) => {
    const slot = index + 1;
    const centerWeight = runningWeight + weight / 2;
    slotAngles.set(slot, centerWeight / totalWeight);
    runningWeight += weight;
  });

  const getAngleForSlot = (slot: number) => {
    const normalized = slotAngles.get(slot) ?? 0;
    return -(normalized * Math.PI * 2) - Math.PI / 2;
  };

  elements.forEach((el) => {
    let period = el.period;
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

    // Compress the f-block so the main sectors can breathe a little more.
    const groupAngle = getAngleForSlot(logicalGroup);

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
