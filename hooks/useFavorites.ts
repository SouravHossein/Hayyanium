
import { useState, useEffect, useCallback } from 'react';

export const useFavorites = (): [number[], (atomicNumber: number) => void] => {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('periodicTableFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
    }
  }, []);

  const toggleFavorite = useCallback((atomicNumber: number) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(atomicNumber)
        ? prevFavorites.filter(id => id !== atomicNumber)
        : [...prevFavorites, atomicNumber];
      
      try {
        localStorage.setItem('periodicTableFavorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.error("Failed to save favorites to localStorage", error);
      }
      
      return newFavorites;
    });
  }, []);

  return [favorites, toggleFavorite];
};
