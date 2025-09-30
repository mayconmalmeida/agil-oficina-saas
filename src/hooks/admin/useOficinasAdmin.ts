
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Oficina {
  id: string;
  user_id: string;
  nome_oficina: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  is_active: boolean;
  created_at: string;
  plano: string | null;
  subscription_status?: string;
}

export const useOficinasAdmin = () => {
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOficinas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as oficinas
      const { data: oficinasData, error: oficinasError } = await supabase
        .from('oficinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (oficinasError) throw oficinasError;

      // Buscar status de assinatura para cada oficina
      const oficinasWithSubscription = await Promise.all(
        (oficinasData || []).map(async (oficina) => {
          try {
            const { data: subscriptionData } = await supabase
              .from('user_subscriptions')
              .select('status, plan_type')
              .eq('user_id', oficina.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              ...oficina,
              subscription_status: subscriptionData?.status || 'inactive'
            };
          } catch (error) {
            console.error(`Erro ao buscar assinatura para oficina ${oficina.id}:`, error);
            return {
              ...oficina,
              subscription_status: 'inactive'
            };
          }
        })
      );

      setOficinas(oficinasWithSubscription);
    } catch (error: any) {
      console.error('Erro ao buscar oficinas:', error);
      setError(error.message || 'Erro ao carregar oficinas');
      setOficinas([]);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as oficinas."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOficinaStatus = async (oficinaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('oficinas')
        .update({ 
          is_active: !currentStatus,
          ativo: !currentStatus // Manter compatibilidade
        })
        .eq('id', oficinaId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Oficina desativada" : "Oficina ativada",
        description: `A oficina foi ${currentStatus ? 'desativada' : 'ativada'} com sucesso.`,
      });

      // Recarregar dados
      fetchOficinas();
    } catch (error: any) {
      console.error('Erro ao alterar status da oficina:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível alterar o status da oficina."
      });
    }
  };

  const deleteOficina = async (oficinaId: string) => {
    try {
      const { error } = await supabase
        .from('oficinas')
        .delete()
        .eq('id', oficinaId);

      if (error) throw error;

      toast({
        title: "Oficina removida",
        description: "A oficina foi removida com sucesso.",
      });

      // Recarregar dados
      fetchOficinas();
    } catch (error: any) {
      console.error('Erro ao remover oficina:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível remover a oficina."
      });
    }
  };

  useEffect(() => {
    fetchOficinas();
  }, []);

  return {
    oficinas,
    isLoading,
    error,
    fetchOficinas,
    toggleOficinaStatus,
    deleteOficina
  };
};
