"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../lib/supabase/client';

export const useFavorites = (): [number[], (atomicNumber: number) => void] => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      let localFavs: number[] = [];
      try {
        const storedFavorites = localStorage.getItem('periodicTableFavorites');
        if (storedFavorites) {
          localFavs = JSON.parse(storedFavorites);
        }
      } catch (error) {}

      if (user) {
        const { data } = await supabase
          .from('user_favorites')
          .select('atomic_number')
          .eq('user_id', user.id);
        
        const remoteFavs = data?.map(d => d.atomic_number) || [];
        const toAdd = localFavs.filter(f => !remoteFavs.includes(f));
        
        if (toAdd.length > 0) {
          const payload = toAdd.map(f => ({ user_id: user.id, atomic_number: f }));
          await supabase.from('user_favorites').upsert(payload, { onConflict: 'user_id, atomic_number' });
        }

        const merged = Array.from(new Set([...remoteFavs, ...localFavs]));
        setFavorites(merged);
        localStorage.setItem('periodicTableFavorites', JSON.stringify(merged));
      } else {
        setFavorites(localFavs);
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback((atomicNumber: number) => {
    setFavorites(prevFavorites => {
      const isFav = prevFavorites.includes(atomicNumber);
      const newFavorites = isFav
        ? prevFavorites.filter(id => id !== atomicNumber)
        : [...prevFavorites, atomicNumber];
      
      try {
        localStorage.setItem('periodicTableFavorites', JSON.stringify(newFavorites));
      } catch (error) {}
      
      if (user) {
        if (isFav) {
          supabase.from('user_favorites').delete().eq('user_id', user.id).eq('atomic_number', atomicNumber).then();
        } else {
          supabase.from('user_favorites').upsert({ user_id: user.id, atomic_number: atomicNumber }, { onConflict: 'user_id, atomic_number' }).then();
        }
      }

      return newFavorites;
    });
  }, [user]);

  return [favorites, toggleFavorite];
};
