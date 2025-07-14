import { useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { Oficina } from '@/types/subscriptions';

export const useOficinasData = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);

  const fetchOficinas = useCallback(async () => {
    try {
      // First get all profiles (which have valid user_ids)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, nome_oficina');

      if (profilesError) throw profilesError;

      // Then get oficinas that match these user_ids
      const validUserIds = profilesData.map(p => p.id);
      
      const { data: oficinasData, error: oficinasError } = await supabase
        .from('oficinas')
        .select('id, nome_oficina, user_id')
        .in('user_id', validUserIds)
        .order('nome_oficina');

      if (oficinasError) throw oficinasError;

      // Combine the data
      const oficinasWithProfiles = oficinasData.map(oficina => {
        const profile = profilesData.find(p => p.id === oficina.user_id);
        return {
          ...oficina,
          nome_oficina: oficina.nome_oficina || profile?.nome_oficina || profile?.email || 'Nome não definido'
        };
      });

      setOficinas(oficinasWithProfiles);
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error);
    }
  }, []);

  return {
    oficinas,
    fetchOficinas
  };
};