"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../lib/supabase/client';

export const useDiscovery = () => {
  const [discovered, setDiscovered] = useState<number[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchDiscovery = async () => {
      let localDisc: number[] = [];
      const saved = localStorage.getItem('discovered_elements');
      if (saved) {
        try {
          localDisc = JSON.parse(saved);
        } catch (e) {}
      }

      if (user) {
        const { data } = await supabase
          .from('user_discoveries')
          .select('atomic_number')
          .eq('user_id', user.id);
        
        const remoteDisc = data?.map(d => d.atomic_number) || [];
        const toAdd = localDisc.filter(f => !remoteDisc.includes(f));
        
        if (toAdd.length > 0) {
          const payload = toAdd.map(f => ({ user_id: user.id, atomic_number: f }));
          await supabase.from('user_discoveries').upsert(payload, { onConflict: 'user_id, atomic_number' });
        }

        const merged = Array.from(new Set([...remoteDisc, ...localDisc]));
        setDiscovered(merged);
        localStorage.setItem('discovered_elements', JSON.stringify(merged));
      } else {
        setDiscovered(localDisc);
      }
    };
    fetchDiscovery();
  }, [user]);

  const discover = useCallback((atomicNumber: number) => {
    setDiscovered((prev) => {
      if (prev.includes(atomicNumber)) return prev;
      const next = [...prev, atomicNumber];
      localStorage.setItem('discovered_elements', JSON.stringify(next));
      
      if (user) {
        supabase.from('user_discoveries').upsert({ user_id: user.id, atomic_number: atomicNumber }, { onConflict: 'user_id, atomic_number' }).then();
      }

      return next;
    });
  }, [user]);

  return { discovered, discover };
};
