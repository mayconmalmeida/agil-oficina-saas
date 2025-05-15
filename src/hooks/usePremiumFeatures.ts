
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export type PremiumFeature = 
  | 'reports' 
  | 'advanced_scheduling' 
  | 'bulk_import' 
  | 'marketing_tools' 
  | 'integrations';

export const usePremiumFeatures = (planType: string, daysRemaining: number) => {
  const { toast } = useToast();
  const [premiumFeaturesEnabled, setPremiumFeaturesEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // During trial or when premium plan is active, premium features are enabled
    const isPremium = planType === 'premium';
    const isTrialActive = daysRemaining > 0;
    
    setPremiumFeaturesEnabled(isPremium || isTrialActive);
  }, [planType, daysRemaining]);
  
  const checkAccess = (feature: PremiumFeature): boolean => {
    return premiumFeaturesEnabled;
  };
  
  const handlePremiumFeature = (feature: PremiumFeature) => {
    if (premiumFeaturesEnabled) {
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Esta funcionalidade está disponível apenas para usuários Premium ou em período de teste.",
      });
      return false;
    }
  };
  
  return {
    isPremium: planType === 'premium',
    isTrialActive: daysRemaining > 0,
    premiumFeaturesEnabled,
    checkAccess,
    handlePremiumFeature,
    daysRemaining
  };
};
