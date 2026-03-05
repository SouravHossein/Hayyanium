import { useCallback, useMemo, useState } from 'react';
import { ElementData } from '../types';

type MoveDirection = 'left' | 'right' | 'up' | 'down';

export const useKeyboardNavigation = (elements: ElementData[]) => {
  const [focusedAtomicNumber, setFocusedAtomicNumber] = useState<number | null>(null);

  const positionMap = useMemo(() => {
    const map = new Map<string, ElementData>();
    elements.forEach(el => {
      map.set(`${el.xpos},${el.ypos}`, el);
    });
    return map;
  }, [elements]);

  const atomicLookup = useMemo(() => {
    const map = new Map<number, ElementData>();
    elements.forEach(el => map.set(el.atomicNumber, el));
    return map;
  }, [elements]);

  const moveFocus = useCallback((direction: MoveDirection) => {
    if (elements.length === 0) return;
    const current = focusedAtomicNumber ? atomicLookup.get(focusedAtomicNumber) : elements[0];
    if (!current) return;

    let { xpos, ypos } = current;
    const delta = direction === 'left' ? [-1, 0]
      : direction === 'right' ? [1, 0]
      : direction === 'up' ? [0, -1]
      : [0, 1];

    for (let step = 0; step < 20; step += 1) {
      xpos += delta[0];
      ypos += delta[1];
      const next = positionMap.get(`${xpos},${ypos}`);
      if (next) {
        setFocusedAtomicNumber(next.atomicNumber);
        return;
      }
    }
  }, [atomicLookup, elements, focusedAtomicNumber, positionMap]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus('left');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus('right');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus('up');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus('down');
    }
  }, [moveFocus]);

  return {
    focusedAtomicNumber,
    setFocusedAtomicNumber,
    handleKeyDown,
  };
};
