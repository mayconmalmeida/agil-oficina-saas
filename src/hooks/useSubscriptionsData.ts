
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

      // Para cada assinatura, buscar dados do perfil do usuário e preço do plano
      const subscriptionsWithProfiles = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          let profile: any = {};
          let planPrice = 0;

          try {
            // Primeiro, buscar perfil do usuário na tabela profiles
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email, nome_oficina, id')
              .eq('id', subscription.user_id)
              .maybeSingle();

            console.log('[DEBUG] Profile data for user', subscription.user_id, ':', profileData);

            if (!profileError && profileData) {
              profile = {
                email: profileData.email || 'Email não encontrado',
                nome_oficina: profileData.nome_oficina || 'Nome não definido'
              };
            } else {
              // Se não encontrou no profiles, tentar na tabela oficinas
              const { data: oficinaData, error: oficinaError } = await supabase
                .from('oficinas')
                .select('email, nome_oficina, user_id')
                .eq('user_id', subscription.user_id)
                .maybeSingle();

              if (!oficinaError && oficinaData) {
                profile = {
                  email: oficinaData.email || 'Email não encontrado',
                  nome_oficina: oficinaData.nome_oficina || 'Nome não definido'
                };
              } else {
                // Último recurso: buscar na tabela auth.users através de uma função RPC
                try {
                  const { data: userData } = await supabase.auth.admin.getUserById(subscription.user_id);
                  if (userData.user) {
                    profile = {
                      email: userData.user.email || 'Email não encontrado',
                      nome_oficina: userData.user.user_metadata?.nome_oficina || 'Nome não definido'
                    };
                  }
                } catch (authError) {
                  console.error('[DEBUG] Erro ao buscar dados do auth:', authError);
                  profile = {
                    email: 'Email não encontrado',
                    nome_oficina: 'Nome não definido'
                  };
                }
              }
            }

            // Buscar preço do plano da tabela plan_configurations
            const planType = subscription.plan_type.replace('_anual', '').replace('_mensal', '');
            const billingCycle = subscription.plan_type.includes('_anual') ? 'anual' : 'mensal';
            
            const { data: planData, error: planError } = await supabase
              .from('plan_configurations')
              .select('price')
              .eq('plan_type', planType)
              .eq('billing_cycle', billingCycle)
              .maybeSingle();

            if (planError) {
              console.error('[DEBUG] Erro ao buscar plan_configurations:', planError);
            } else if (planData) {
              planPrice = planData.price || 0;
            }

            // Se não encontrou preço nas configurações, usar valores padrão
            if (planPrice === 0) {
              if (subscription.plan_type === 'essencial_mensal') planPrice = 49.90;
              else if (subscription.plan_type === 'essencial_anual') planPrice = 499.00;
              else if (subscription.plan_type === 'premium_mensal') planPrice = 99.90;
              else if (subscription.plan_type === 'premium_anual') planPrice = 999.00;
            }

          } catch (err: any) {
            console.error('[DEBUG] Erro ao buscar dados adicionais:', err);
            profile = {
              email: 'Erro ao carregar email',
              nome_oficina: 'Erro ao carregar nome'
            };
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
            amount: planPrice * 100, // Converter para centavos para manter compatibilidade
            email: profile.email,
            nome_oficina: profile.nome_oficina,
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
