import { ElementData } from '../types';
import { LayoutEngine, LayoutResult, LayoutPosition } from './types';

/**
 * Benfey-style Spiral periodic table.
 * Elements placed along a parametric spiral by atomic number.
 */
export const spiralLayout: LayoutEngine = (elements: ElementData[]): LayoutResult => {
  const positions = new Map<number, LayoutPosition>();
  const cellSize = 40;
  const scale = 4.5;
  const angularStep = 0.38;

  const sorted = [...elements].sort((a, b) => a.atomicNumber - b.atomicNumber);

  // First pass: compute positions to find bounding box
  const rawPositions: { z: number; x: number; y: number }[] = [];
  sorted.forEach((el) => {
    const theta = el.atomicNumber * angularStep;
    const r = theta * scale;
    rawPositions.push({
      z: el.atomicNumber,
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    });
  });

  // Find bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  rawPositions.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  const padding = cellSize + 20;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  // Second pass: normalize positions
  rawPositions.forEach((p) => {
    positions.set(p.z, {
      x: p.x - minX + padding - cellSize / 2,
      y: p.y - minY + padding - cellSize / 2,
      w: cellSize,
      h: cellSize,
    });
  });

  return {
    positions,
    containerWidth: width,
    containerHeight: height,
  };
};
