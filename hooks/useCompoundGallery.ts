import { useState, useEffect, useCallback } from 'react';
import { ElementData, SavedCompound } from '../types';

const GALLERY_KEY = 'periodicTableCompoundGallery';

type SaveableCompound = {
    formula: string;
    name: string;
    elements: ElementData[];
};

export const useCompoundGallery = (): {
  savedCompounds: SavedCompound[];
  saveCompound: (compound: SaveableCompound) => void;
  deleteCompound: (compoundId: string) => void;
} => {
  const [gallery, setGallery] = useState<SavedCompound[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GALLERY_KEY);
      if (stored) {
        setGallery(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load compound gallery from localStorage", error);
    }
  }, []);

  const saveCompound = useCallback((compound: SaveableCompound) => {
    const newCompound: SavedCompound = {
      ...compound,
      id: new Date().toISOString(),
    };
    setGallery(prev => {
      const newGallery = [...prev, newCompound];
      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(newGallery));
      } catch (error) {
        console.error("Failed to save compound to localStorage", error);
      }
      return newGallery;
    });
  }, []);

  const deleteCompound = useCallback((compoundId: string) => {
    setGallery(prev => {
      const newGallery = prev.filter(c => c.id !== compoundId);
      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(newGallery));
      } catch (error) {
        console.error("Failed to save compound gallery to localStorage", error);
      }
      return newGallery;
    });
  }, []);

  return { savedCompounds: gallery, saveCompound, deleteCompound };
};
