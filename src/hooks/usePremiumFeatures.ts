
import React, { useEffect, useState } from 'react';
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
 * Hook simplificado para premium features (agora só temos Premium)
 */
export const usePremiumFeatures = (planType: string, daysRemaining: number) => {
  const { toast } = useToast();
  const { isPremiumTrial } = useDaysRemaining();
  const [premiumFeaturesEnabled, setPremiumFeaturesEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // Usuário tem acesso premium ou está em trial ativo
    const isPremium = planType === 'premium';
    const isTrialActive = daysRemaining > 0;
    
    setPremiumFeaturesEnabled(isPremium || isTrialActive);
  }, [planType, daysRemaining, isPremiumTrial]);

  /**
   * Verificar acesso a feature premium
   */
  const checkAccess = (feature: PremiumFeature): boolean => {
    // Se usuário tem plano premium OU está em trial, permitir acesso
    return planType === 'premium' || daysRemaining > 0;
  };
  
  /**
   * Lidar com acesso a feature premium
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
   * Informações sobre disponibilidade de features
   */
  const getFeatureAvailability = () => {
    const hasAccess = checkAccess('reports'); // Usar qualquer feature como referência
    
    return {
      premiumFeatures: {
        relatorios: hasAccess,
        exportacaoXML: hasAccess,
        marketing: hasAccess,
        agendamentos: hasAccess,
        suportePrioritario: hasAccess,
        diagnosticoIA: hasAccess,
        integracoes: hasAccess
      }
    };
  };
  
  return {
    isPremium: planType === 'premium' || daysRemaining > 0,
    isTrialActive: daysRemaining > 0,
    premiumFeaturesEnabled,
    checkAccess,
    handlePremiumFeature,
    getFeatureAvailability,
    daysRemaining
  };
};
