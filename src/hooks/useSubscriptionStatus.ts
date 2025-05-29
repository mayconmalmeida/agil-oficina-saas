
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionStatus } from '@/types/subscription';
import { getPlanDetails, calculateDaysRemaining } from '@/utils/planUtils';

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

  const calculateSubscriptionStatus = () => {
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
