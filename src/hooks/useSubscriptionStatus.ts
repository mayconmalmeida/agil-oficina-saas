
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionStatus } from '@/types/subscription';
import { getPlanDetails, calculateDaysRemaining } from '@/utils/planUtils';
import { supabase } from '@/lib/supabase';

export const useSubscriptionStatus = () => {
  const { user, isLoadingAuth } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasSubscription: false,
    subscription: null,
    isTrialActive: false,
    isPaidActive: false,
    canAccessFeatures: false,
    isPremium: false,
    isEssencial: false,
    daysRemaining: 0,
    planDetails: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSubscriptionStatus = async () => {
    // Aguarda o carregamento da autenticação
    if (isLoadingAuth) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setSubscriptionStatus({
          hasSubscription: false,
          subscription: null,
          isTrialActive: false,
          isPaidActive: false,
          canAccessFeatures: false,
          isPremium: false,
          isEssencial: false,
          daysRemaining: 0,
          planDetails: null
        });
        setLoading(false);
        return;
      }

      // Admin não precisa de validação de assinatura
      if (user.role === 'admin' || user.role === 'superadmin') {
        console.log('Admin detectado no useSubscriptionStatus, retornando acesso total');
        setSubscriptionStatus({
          hasSubscription: true,
          subscription: null,
          isTrialActive: false,
          isPaidActive: true, // Admin tem acesso como se fosse pago
          canAccessFeatures: true,
          isPremium: true, // Admin tem acesso premium
          isEssencial: true,
          daysRemaining: 999, // Valor simbólico para admin
          planDetails: {
            name: 'Administrador',
            type: 'premium',
            billing: 'anual',
            price: 'Acesso Total',
            features: ['Acesso administrativo completo']
          }
        });
        setLoading(false);
        return;
      }

      // Buscar assinatura mais recente da tabela user_subscriptions
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Erro ao buscar assinatura:', subscriptionError);
      }

      console.log('useSubscriptionStatus: Dados da assinatura encontrados:', subscriptionData);

      const subscription = subscriptionData || user.subscription;

      if (subscription) {
        const now = new Date();
        
        const isTrialActive = subscription.status === 'trialing' && 
          subscription.trial_ends_at && 
          new Date(subscription.trial_ends_at) > now;
        
        const isPaidActive = subscription.status === 'active' && 
          (!subscription.ends_at || new Date(subscription.ends_at) > now);
        
        // Verificar assinatura manual ativa
        const isManualActive = subscription.is_manual && 
          subscription.status === 'active' &&
          (!subscription.ends_at || new Date(subscription.ends_at) > now);
        
        // Verificar se ainda está dentro do período válido (trial, pago ou manual)
        const canAccessFeatures = isTrialActive || isPaidActive || isManualActive;
        
        const isPremium = subscription.plan_type?.includes('premium') || false;
        const isEssencial = subscription.plan_type?.includes('essencial') || false;
        const planDetails = getPlanDetails(subscription.plan_type || '');
        
        // Calcular dias restantes considerando trial, paid e manual
        let daysRemaining = 0;
        if (isTrialActive && subscription.trial_ends_at) {
          daysRemaining = Math.ceil((new Date(subscription.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if ((isPaidActive || isManualActive) && subscription.ends_at) {
          daysRemaining = Math.ceil((new Date(subscription.ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if ((isPaidActive || isManualActive) && !subscription.ends_at) {
          // Se não tem data de fim, considerar como ativo indefinidamente
          daysRemaining = 9999;
        }

        console.log('useSubscriptionStatus: Status calculado:', {
          isTrialActive,
          isPaidActive,
          isManualActive,
          canAccessFeatures,
          daysRemaining
        });

        setSubscriptionStatus({
          hasSubscription: true,
          subscription: subscription as any, // Cast necessário para compatibilidade
          isTrialActive,
          isPaidActive,
          canAccessFeatures,
          isPremium,
          isEssencial,
          daysRemaining: Math.max(0, daysRemaining),
          planDetails
        });
      } else {
        setSubscriptionStatus({
          hasSubscription: false,
          subscription: null,
          isTrialActive: false,
          isPaidActive: false,
          canAccessFeatures: false,
          isPremium: false,
          isEssencial: false,
          daysRemaining: 0,
          planDetails: null
        });
      }
    } catch (err: any) {
      console.error('Erro ao calcular status da assinatura:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSubscriptionStatus();
  }, [user, isLoadingAuth]);

  return {
    subscriptionStatus,
    loading,
    error,
    refreshSubscription: calculateSubscriptionStatus
  };
};
