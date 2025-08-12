
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface OficinaFilter {
  column: 'user_id' | 'oficina_id';
  value: string;
}

export const useOficinaFilters = () => {
  const [oficina_id, setOficinaId] = useState<string | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsReady(true);
          return;
        }

        setUserId(session.user.id);

        // Check if user has an oficina
        const { data: oficinaData } = await supabase
          .from('oficinas')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (oficinaData) {
          setOficinaId(oficinaData.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadUserData();
  }, []);

  return {
    oficina_id,
    user_id,
    isReady
  };
};

export const getOficinaFilter = (oficina_id: string | null, user_id: string | null): OficinaFilter | null => {
  if (oficina_id) {
    return { column: 'oficina_id', value: oficina_id };
  } else if (user_id) {
    return { column: 'user_id', value: user_id };
  }
  return null;
};
