
import React, { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SubscriptionWithProfile } from '@/utils/supabaseTypes';

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

            // Map the user_subscriptions data to match SubscriptionWithProfile interface
            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan: subscription.plan_type, // Map plan_type to plan
              status: subscription.status,
              started_at: subscription.starts_at, // Map starts_at to started_at
              created_at: subscription.created_at,
              ends_at: subscription.ends_at,
              expires_at: subscription.ends_at, // Map ends_at to expires_at
              payment_method: subscription.stripe_subscription_id ? 'stripe' : 'manual', // Infer payment method
              amount: 0, // Default amount, can be updated based on plan_type
              email: oficina?.email || 'Email não encontrado',
              nome_oficina: oficina?.nome_oficina || 'Nome não encontrado'
            } as SubscriptionWithProfile;
          } catch (error) {
            console.warn(`Erro ao buscar oficina para assinatura ${subscription.id}:`, error);
            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan: subscription.plan_type,
              status: subscription.status,
              started_at: subscription.starts_at,
              created_at: subscription.created_at,
              ends_at: subscription.ends_at,
              expires_at: subscription.ends_at,
              payment_method: subscription.stripe_subscription_id ? 'stripe' : 'manual',
              amount: 0,
              email: 'Email não encontrado',
              nome_oficina: 'Nome não encontrado'
            } as SubscriptionWithProfile;
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
