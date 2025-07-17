
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SubscriptionWithProfile } from '@/types/subscriptions';

export const useSubscriptionsData = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as assinaturas da nova tabela user_subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[DEBUG] Assinaturas - subscriptionsData:', subscriptionsData, 'subscriptionsError:', subscriptionsError);

      if (subscriptionsError) throw subscriptionsError;

      // Para cada assinatura, buscar dados do perfil do usuário
      const subscriptionsWithProfiles = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          let profile: any = {};
          let planData: any = { price: 0 };

          try {
            // Buscar perfil
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email, nome_oficina')
              .eq('id', subscription.user_id)
              .maybeSingle();

            if (profileError) {
              console.error('[DEBUG] Erro ao buscar perfil:', profileError);
            }
            profile = profileData || {};

            // Se não encontrou nome_oficina no profiles, buscar na tabela oficinas
            if (!profile.nome_oficina) {
              const { data: oficinaData, error: oficinaError } = await supabase
                .from('oficinas')
                .select('nome_oficina')
                .eq('user_id', subscription.user_id)
                .maybeSingle();

              if (!oficinaError && oficinaData) {
                profile.nome_oficina = oficinaData.nome_olicina;
              }
            }

            // Buscar preço do plano da tabela plan_configurations
            const planType = subscription.plan_type.replace('_anual', '').replace('_mensal', '');
            const billingCycle = subscription.plan_type.includes('_anual') ? 'anual' : 'mensal';
            
            const { data: planDatum, error: planError } = await supabase
              .from('plan_configurations')
              .select('price')
              .eq('plan_type', planType)
              .eq('billing_cycle', billingCycle)
              .maybeSingle();

            if (planError) {
              console.error('[DEBUG] Erro ao buscar plan_configurations:', planError);
            }
            planData = planDatum || { price: 0 };
          } catch (err: any) {
            console.error('[DEBUG] Erro ao buscar perfil/plan_data:', err);
          }

          return {
            id: subscription.id,
            user_id: subscription.user_id,
            plan: subscription.plan_type,
            status: subscription.status,
            started_at: subscription.starts_at,
            created_at: subscription.created_at,
            ends_at: subscription.ends_at,
            expires_at: subscription.trial_ends_at || subscription.ends_at,
            payment_method: subscription.is_manual ? 'Manual' : 'Stripe',
            amount: (planData?.price || 0) * 100, // Converter para centavos para manter compatibilidade
            email: profile?.email || 'Email não encontrado',
            nome_oficina: profile?.nome_oficina || 'Nome não encontrado',
          };
        })
      );

      setSubscriptions(subscriptionsWithProfiles);
    } catch (error: any) {
      setError(error.message ?? "Erro desconhecido ao carregar assinaturas.");
      setSubscriptions([]);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as assinaturas."
      });
      console.error('[DEBUG] Erro global ao carregar assinaturas:', error);
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
