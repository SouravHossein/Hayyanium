"use client";

import { useState, useEffect, useCallback } from 'react';

export const useDiscovery = () => {
  const [discovered, setDiscovered] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('discovered_elements');
    if (saved) {
      try {
        setDiscovered(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse discovered elements', e);
      }
    }
  }, []);

  const discover = useCallback((atomicNumber: number) => {
    setDiscovered((prev) => {
      if (prev.includes(atomicNumber)) return prev;
      const next = [...prev, atomicNumber];
      localStorage.setItem('discovered_elements', JSON.stringify(next));
      return next;
    });
  }, []);

  return { discovered, discover };
};
