
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface SubscriptionWithProfile {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  is_manual: boolean;
  user_email: string;
  nome_oficina: string;
}

export const useSubscriptionsData = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Buscando assinaturas...');
      
      // Buscar assinaturas
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Erro ao buscar assinaturas:', subscriptionsError);
        throw subscriptionsError;
      }

      console.log('Assinaturas encontradas:', subscriptionsData?.length || 0);

      // Para cada assinatura, buscar informações da oficina
      const subscriptionsWithProfile = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          try {
            // Buscar oficina pelo user_id
            const { data: oficina } = await supabase
              .from('oficinas')
              .select('nome_oficina, email')
              .eq('user_id', subscription.user_id)
              .single();

            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan_type: subscription.plan_type,
              status: subscription.status,
              starts_at: subscription.starts_at,
              ends_at: subscription.ends_at,
              trial_ends_at: subscription.trial_ends_at,
              created_at: subscription.created_at,
              is_manual: subscription.is_manual || false,
              user_email: oficina?.email || 'Email não encontrado',
              nome_oficina: oficina?.nome_oficina || 'Nome não encontrado'
            };
          } catch (error) {
            console.warn(`Erro ao buscar oficina para assinatura ${subscription.id}:`, error);
            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan_type: subscription.plan_type,
              status: subscription.status,
              starts_at: subscription.starts_at,
              ends_at: subscription.ends_at,
              trial_ends_at: subscription.trial_ends_at,
              created_at: subscription.created_at,
              is_manual: subscription.is_manual || false,
              user_email: 'Email não encontrado',
              nome_oficina: 'Nome não encontrado'
            };
          }
        })
      );

      setSubscriptions(subscriptionsWithProfile);
      console.log('Assinaturas processadas:', subscriptionsWithProfile.length);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar assinaturas';
      setError(errorMessage);
      setSubscriptions([]);
      console.error('Erro completo:', error);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as assinaturas."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions
  };
};
