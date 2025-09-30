
import React, { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  is_active: boolean;
  created_at: string;
  plano?: string;
  subscription_status?: string;
}

export const useOficinasData = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOficinas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Buscando oficinas...');
      
      // Buscar oficinas com informações de assinatura
      const { data: oficinasData, error: oficinasError } = await supabase
        .from('oficinas')
        .select(`
          id,
          user_id,
          nome_oficina,
          cnpj,
          telefone,
          email,
          responsavel,
          is_active,
          created_at,
          plano
        `)
        .order('created_at', { ascending: false });

      if (oficinasError) {
        console.error('Erro ao buscar oficinas:', oficinasError);
        throw oficinasError;
      }

      console.log('Oficinas encontradas:', oficinasData?.length || 0);

      // Para cada oficina, buscar status da assinatura
      const oficinasWithSubscription = await Promise.all(
        (oficinasData || []).map(async (oficina) => {
          try {
            const { data: subscription } = await supabase
              .from('user_subscriptions')
              .select('status, plan_type')
              .eq('user_id', oficina.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...oficina,
              subscription_status: subscription?.status || 'inactive',
              plano: subscription?.plan_type || oficina.plano || 'Essencial'
            };
          } catch (error) {
            console.warn(`Erro ao buscar assinatura para oficina ${oficina.id}:`, error);
            return {
              ...oficina,
              subscription_status: 'inactive'
            };
          }
        })
      );

      setOficinas(oficinasWithSubscription);
      console.log('Oficinas processadas:', oficinasWithSubscription.length);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar oficinas';
      setError(errorMessage);
      setOficinas([]);
      console.error('Erro completo:', error);
      
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
