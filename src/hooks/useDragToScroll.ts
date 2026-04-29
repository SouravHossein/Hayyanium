import { useRef, useState, useEffect } from 'react';

export function useDragToScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - ele.offsetLeft);
      setScrollLeft(ele.scrollLeft);
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      ele.style.cursor = 'grab';
      ele.style.userSelect = '';
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      ele.style.cursor = 'grab';
      ele.style.userSelect = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - ele.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      ele.scrollLeft = scrollLeft - walk;
    };

    ele.addEventListener('mousedown', handleMouseDown);
    ele.addEventListener('mouseleave', handleMouseLeave);
    ele.addEventListener('mouseup', handleMouseUp);
    ele.addEventListener('mousemove', handleMouseMove);

    return () => {
      ele.removeEventListener('mousedown', handleMouseDown);
      ele.removeEventListener('mouseleave', handleMouseLeave);
      ele.removeEventListener('mouseup', handleMouseUp);
      ele.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  return ref;
}
