
import { useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { Oficina } from '@/types/subscriptions';

export const useOficinasData = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOficinas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: oficinasData, error: oficinasError } = await supabase
        .from('oficinas')
        .select('id, nome_oficina, user_id')
        .order('nome_oficina', { ascending: true });

      if (oficinasError) {
        console.error('Erro ao buscar oficinas:', oficinasError);
        throw oficinasError;
      }

      // Garantir que temos pelo menos nome da oficina ou ID como fallback
      const oficinasFormatted = (oficinasData || []).map(oficina => ({
        ...oficina,
        nome_oficina: oficina.nome_oficina || `Oficina ${oficina.id.slice(0, 8)}`
      }));

      setOficinas(oficinasFormatted);
      
      if (oficinasFormatted.length === 0) {
        setError('Nenhuma oficina cadastrada. Cadastre uma oficina antes de atribuir uma assinatura.');
      }
    } catch (error: any) {
      console.error('Erro ao buscar oficinas:', error);
      setError(error.message || 'Erro ao carregar oficinas');
      setOficinas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    oficinas,
    isLoading,
    error,
    fetchOficinas
  };
};
