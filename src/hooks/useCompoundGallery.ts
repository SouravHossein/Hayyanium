"use client";

import { useState, useEffect, useCallback } from 'react';
import { ElementData, SavedCompound } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../lib/supabase/client';

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
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchGallery = async () => {
      let localGallery: SavedCompound[] = [];
      try {
        const stored = localStorage.getItem(GALLERY_KEY);
        if (stored) {
          localGallery = JSON.parse(stored);
        }
      } catch (error) {}

      if (user) {
        const { data, error } = await supabase
          .from('saved_compounds')
          .select('*')
          .eq('user_id', user.id);
        
        let remoteGallery: SavedCompound[] = [];
        if (data && !error) {
           remoteGallery = data.map(d => ({
             id: d.id,
             formula: d.formula,
             name: d.name,
             elements: d.elements
           }));
        }

        const remoteIds = remoteGallery.map(c => c.id);
        const toAdd = localGallery.filter(c => !remoteIds.includes(c.id));
        
        if (toAdd.length > 0) {
          const payload = toAdd.map(c => ({
            id: c.id,
            user_id: user.id,
            formula: c.formula,
            name: c.name,
            elements: c.elements
          }));
          await supabase.from('saved_compounds').upsert(payload, { onConflict: 'id' });
        }

        // Merge logic based on ID
        const mergedArray = [...remoteGallery];
        toAdd.forEach(c => mergedArray.push(c));
        
        setGallery(mergedArray);
        localStorage.setItem(GALLERY_KEY, JSON.stringify(mergedArray));
      } else {
        setGallery(localGallery);
      }
    };
    fetchGallery();
  }, [user]);

  const saveCompound = useCallback((compound: SaveableCompound) => {
    const newCompound: SavedCompound = {
      ...compound,
      id: new Date().toISOString(),
    };
    setGallery(prev => {
      const newGallery = [...prev, newCompound];
      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(newGallery));
      } catch (error) {}
      
      if (user) {
        supabase.from('saved_compounds').upsert({
          id: newCompound.id,
          user_id: user.id,
          formula: newCompound.formula,
          name: newCompound.name,
          elements: newCompound.elements
        }, { onConflict: 'id' }).then();
      }

      return newGallery;
    });
  }, [user]);

  const deleteCompound = useCallback((compoundId: string) => {
    setGallery(prev => {
      const newGallery = prev.filter(c => c.id !== compoundId);
      try {
        localStorage.setItem(GALLERY_KEY, JSON.stringify(newGallery));
      } catch (error) {}
      
      if (user) {
        supabase.from('saved_compounds').delete().eq('user_id', user.id).eq('id', compoundId).then();
      }

      return newGallery;
    });
  }, [user]);

  return { savedCompounds: gallery, saveCompound, deleteCompound };
};
