
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Oficina } from '@/types/subscriptions';

export const useOficinasData = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOficinas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as oficinas com informações completas
      const { data: oficinasData, error: oficinasError } = await supabase
        .from('oficinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (oficinasError) {
        console.error('Erro ao buscar oficinas:', oficinasError);
        throw oficinasError;
      }

      // Transformar dados para o formato esperado
      const oficinasFormatted: Oficina[] = (oficinasData || []).map(oficina => ({
        id: oficina.id,
        nome_oficina: oficina.nome_oficina || 'Nome não informado',
        user_id: oficina.user_id
      }));

      setOficinas(oficinasFormatted);
      console.log(`[DEBUG] Carregadas ${oficinasFormatted.length} oficinas`);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar oficinas';
      setError(errorMessage);
      setOficinas([]);
      console.error('[DEBUG] Erro ao carregar oficinas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as oficinas."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    oficinas,
    isLoading,
    error,
    fetchOficinas
  };
};
