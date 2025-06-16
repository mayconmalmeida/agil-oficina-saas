
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDaysRemaining } from './useDaysRemaining';

export type PremiumFeature = 
  | 'reports' 
  | 'advanced_scheduling' 
  | 'bulk_import' 
  | 'marketing_tools' 
  | 'integrations'
  | 'export_xml'
  | 'priority_support';

/**
 * Hook to manage access to premium features based on the user's plan type
 * @param planType User's current plan type ('essencial' or 'premium')
 * @param daysRemaining Days remaining in trial period (0 if trial ended)
 * @returns Object with methods to check access to premium features
 */
export const usePremiumFeatures = (planType: string, daysRemaining: number) => {
  const { toast } = useToast();
  const { isPremiumTrial } = useDaysRemaining();
  const [premiumFeaturesEnabled, setPremiumFeaturesEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Durante trial, usuário tem acesso premium, ou quando premium plan está ativo
    const isPremium = planType === 'premium';
    const isTrialActive = daysRemaining > 0;
    
    // MUDANÇA: Durante o trial de 7 dias, usuário tem acesso PREMIUM
    setPremiumFeaturesEnabled(isPremium || (isTrialActive && isPremiumTrial));
  }, [planType, daysRemaining, isPremiumTrial]);

  // Map premium features to their respective plans
  const featurePlanMap: Record<PremiumFeature, string> = {
    reports: 'premium',
    advanced_scheduling: 'premium',
    bulk_import: 'premium',
    marketing_tools: 'premium',
    integrations: 'premium',
    export_xml: 'premium',
    priority_support: 'premium'
  };

  /**
   * Check if user has access to a specific premium feature
   * @param feature Premium feature to check access for
   * @returns True if user has access to the feature
   */
  const checkAccess = (feature: PremiumFeature): boolean => {
    // Se feature é disponível em qualquer plano, permitir acesso
    if (featurePlanMap[feature] === 'essencial') {
      return true;
    }
    
    // Se usuário tem plano premium OU está em trial premium, permitir acesso
    if (planType === 'premium' || (daysRemaining > 0 && isPremiumTrial)) {
      return true;
    }
    
    // Feature requer premium e usuário não tem acesso
    return false;
  };
  
  /**
   * Handle access to premium feature with toast notification if not accessible
   * @param feature Premium feature to check access for
   * @returns Boolean indicating whether feature is accessible
   */
  const handlePremiumFeature = (feature: PremiumFeature) => {
    if (checkAccess(feature)) {
      return true;
    } else {
      toast({
        variant: "destructive",
        title: "Recurso Premium",
        description: "Esta funcionalidade está disponível apenas para usuários com plano Premium.",
      });
      return false;
    }
  };

  /**
   * Get detailed information about premium features availability
   * @returns Object with information about feature availability based on user's plan
   */
  const getFeatureAvailability = () => {
    return {
      essencialFeatures: {
        orcamentos: true,
        clientes: true,
        produtos: true,
        estoque: true,
        veiculos: true,
        suporteEmail: true,
        atualizacoes: true
      },
      premiumFeatures: {
        relatorios: checkAccess('reports'),
        exportacaoXML: checkAccess('export_xml'),
        marketing: checkAccess('marketing_tools'),
        agendamentos: checkAccess('advanced_scheduling'),
        suportePrioritario: checkAccess('priority_support')
      }
    };
  };
  
  return {
    isPremium: planType === 'premium' || (daysRemaining > 0 && isPremiumTrial),
    isTrialActive: daysRemaining > 0,
    premiumFeaturesEnabled,
    checkAccess,
    handlePremiumFeature,
    getFeatureAvailability,
    daysRemaining
  };
};
