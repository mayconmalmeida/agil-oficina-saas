import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'essencial_mensal' | 'essencial_anual' | 'premium_mensal' | 'premium_anual' | 'free_trial_essencial' | 'free_trial_premium';
  status: 'active' | 'trialing' | 'cancelled' | 'expired';
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

// Type definitions for RPC responses
interface GetUserSubscriptionResponse {
  success: boolean;
  error?: string;
  has_subscription: boolean;
  subscription?: UserSubscription;
}

interface StartFreeTrialResponse {
  success: boolean;
  error?: string;
  plan_type?: string;
  trial_ends_at?: string;
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  subscription: UserSubscription | null;
  isTrialActive: boolean;
  isPaidActive: boolean;
  canAccessFeatures: boolean;
  isPremium: boolean;
  isEssencial: boolean;
  daysRemaining: number;
  planDetails: {
    name: string;
    type: 'essencial' | 'premium';
    billing: 'mensal' | 'anual' | 'trial';
    price: string;
    features: string[];
  } | null;
}

export const useSubscription = () => {
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
  const { toast } = useToast();

  // Função para obter detalhes do plano
  const getPlanDetails = (planType: string) => {
    const planMap = {
      'essencial_mensal': {
        name: 'Essencial Mensal',
        type: 'essencial' as const,
        billing: 'mensal' as const,
        price: 'R$ 89,90/mês',
        features: [
          'Cadastro de clientes ilimitado',
          'Gestão de orçamentos',
          'Controle de serviços',
          'Relatórios básicos',
          'Suporte via e-mail'
        ]
      },
      'essencial_anual': {
        name: 'Essencial Anual',
        type: 'essencial' as const,
        billing: 'anual' as const,
        price: 'R$ 899,00/ano',
        features: [
          'Cadastro de clientes ilimitado',
          'Gestão de orçamentos',
          'Controle de serviços',
          'Relatórios básicos',
          'Suporte via e-mail'
        ]
      },
      'premium_mensal': {
        name: 'Premium Mensal',
        type: 'premium' as const,
        billing: 'mensal' as const,
        price: 'R$ 179,90/mês',
        features: [
          'Todos os recursos do plano Essencial',
          'Módulo de estoque integrado',
          'Agendamento de serviços',
          'Relatórios avançados',
          'Suporte prioritário',
          'Backup automático'
        ]
      },
      'premium_anual': {
        name: 'Premium Anual',
        type: 'premium' as const,
        billing: 'anual' as const,
        price: 'R$ 1.799,00/ano',
        features: [
          'Todos os recursos do plano Essencial',
          'Módulo de estoque integrado',
          'Agendamento de serviços',
          'Relatórios avançados',
          'Suporte prioritário',
          'Backup automático'
        ]
      },
      'free_trial_essencial': {
        name: 'Teste Grátis - Essencial',
        type: 'essencial' as const,
        billing: 'trial' as const,
        price: 'Grátis por 7 dias',
        features: [
          'Cadastro de clientes ilimitado',
          'Gestão de orçamentos',
          'Controle de serviços',
          'Relatórios básicos',
          'Suporte via e-mail'
        ]
      },
      'free_trial_premium': {
        name: 'Teste Grátis - Premium',
        type: 'premium' as const,
        billing: 'trial' as const,
        price: 'Grátis por 7 dias',
        features: [
          'Todos os recursos do plano Essencial',
          'Módulo de estoque integrado',
          'Agendamento de serviços',
          'Relatórios avançados',
          'Suporte prioritário',
          'Backup automático'
        ]
      }
    };

    return planMap[planType as keyof typeof planMap] || null;
  };

  // Função para calcular dias restantes
  const calculateDaysRemaining = (subscription: UserSubscription | null): number => {
    if (!subscription) return 0;
    
    const now = new Date();
    let endDate: Date | null = null;

    if (subscription.status === 'trialing' && subscription.trial_ends_at) {
      endDate = new Date(subscription.trial_ends_at);
    } else if (subscription.status === 'active' && subscription.ends_at) {
      endDate = new Date(subscription.ends_at);
    }

    if (!endDate) return 0;

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Função para buscar status da assinatura
  const fetchSubscriptionStatus = async () => {
    // Se ainda está carregando auth ou não há usuário, não buscar
    if (isLoadingAuth || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Se o usuário já tem os dados de assinatura do auth, usar eles
      if (user.subscription) {
        const subscription = user.subscription as any;
        const daysRemaining = calculateDaysRemaining(subscription);
        
        const isTrialActive = subscription.status === 'trialing' && 
          subscription.trial_ends_at && 
          new Date(subscription.trial_ends_at) > new Date();
        
        const isPaidActive = subscription.status === 'active' && 
          (!subscription.ends_at || new Date(subscription.ends_at) > new Date());
        
        const canAccessFeatures = user.canAccessFeatures || false;
        const isPremium = subscription.plan_type?.includes('premium') || false;
        const isEssencial = subscription.plan_type?.includes('essencial') || false;
        const planDetails = getPlanDetails(subscription.plan_type || '');

        setSubscriptionStatus({
          hasSubscription: true,
          subscription,
          isTrialActive,
          isPaidActive,
          canAccessFeatures,
          isPremium,
          isEssencial,
          daysRemaining,
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
      console.error('Erro ao buscar status da assinatura:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar teste gratuito
  const startFreeTrial = async (planType: 'essencial' | 'premium') => {
    try {
      const { data, error } = await supabase.rpc('start_free_trial', {
        selected_plan_type: planType
      });

      if (error) {
        throw error;
      }

      // Type assertion for the RPC response (two-step conversion)
      const response = data as unknown as StartFreeTrialResponse;

      if (!response.success) {
        throw new Error(response.error || 'Erro ao iniciar teste gratuito');
      }

      toast({
        title: "Teste gratuito iniciado!",
        description: `Seu teste do plano ${planType === 'premium' ? 'Premium' : 'Essencial'} foi ativado por 7 dias.`
      });

      // Recarregar a página para atualizar o estado de autenticação
      window.location.reload();

      return { success: true };
    } catch (err: any) {
      console.error('Erro ao iniciar teste gratuito:', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message || "Não foi possível iniciar o teste gratuito."
      });
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user, isLoadingAuth]);

  return {
    subscriptionStatus,
    loading,
    error,
    startFreeTrial,
    refreshSubscription: fetchSubscriptionStatus
  };
};
