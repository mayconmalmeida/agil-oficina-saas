
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionStatus } from '@/types/subscription';
import { getPlanDetails, calculateDaysRemaining } from '@/utils/planUtils';
import { startFreeTrial as startFreeTrialService } from '@/services/subscriptionService';

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

  const fetchSubscriptionStatus = async () => {
    if (isLoadingAuth || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (user.subscription) {
        const subscription = user.subscription;
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

  const startFreeTrial = async (planType: 'essencial' | 'premium') => {
    try {
      const result = await startFreeTrialService(planType);

      if (result.success) {
        toast({
          title: "Teste gratuito iniciado!",
          description: `Seu teste do plano ${planType === 'premium' ? 'Premium' : 'Essencial'} foi ativado por 7 dias.`
        });

        window.location.reload();
        return { success: true };
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: result.error || "Não foi possível iniciar o teste gratuito."
        });
        return { success: false, error: result.error };
      }
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
