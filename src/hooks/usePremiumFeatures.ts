
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [premiumFeaturesEnabled, setPremiumFeaturesEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // During trial or when premium plan is active, premium features are enabled
    const isPremium = planType === 'premium';
    const isTrialActive = daysRemaining > 0;
    
    setPremiumFeaturesEnabled(isPremium || isTrialActive);
  }, [planType, daysRemaining]);

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
    // If feature is available on any plan or user is in trial, allow access
    if (featurePlanMap[feature] === 'essencial' || planType === 'premium' || daysRemaining > 0) {
      return true;
    }
    
    // Feature requires premium plan and user isn't in trial
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
    isPremium: planType === 'premium',
    isTrialActive: daysRemaining > 0,
    premiumFeaturesEnabled,
    checkAccess,
    handlePremiumFeature,
    getFeatureAvailability,
    daysRemaining
  };
};
