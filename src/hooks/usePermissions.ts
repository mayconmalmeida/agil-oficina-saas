
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, plan, planActive, isAdmin } = useAuth();

  const hasPermission = (feature: string): boolean => {
    console.log('usePermissions: Verificando permissão:', {
      feature,
      isAdmin,
      plan,
      planActive,
      permissions: permissions.length,
      hasFeature: permissions.includes(feature)
    });

    // Admin tem todas as permissões
    if (isAdmin) {
      console.log('usePermissions: Admin detectado, permitindo acesso');
      return true;
    }
    
    // Se o plano não está ativo, só permite recursos básicos
    if (!planActive) {
      console.log('usePermissions: Plano inativo, verificando recursos básicos');
      return ['clientes', 'orcamentos'].includes(feature);
    }

    // Verificar se tem a permissão específica
    const hasAccess = permissions.includes(feature) || permissions.includes('*');
    console.log('usePermissions: Verificação final de permissão:', hasAccess);
    return hasAccess;
  };

  const isPremium = (): boolean => {
    const result = plan === 'Premium' && planActive;
    console.log('usePermissions: isPremium check:', { plan, planActive, result });
    return result;
  };

  const isEssencial = (): boolean => {
    const result = plan === 'Essencial' && planActive;
    console.log('usePermissions: isEssencial check:', { plan, planActive, result });
    return result;
  };

  const canAccessPremiumFeatures = (): boolean => {
    const result = isAdmin || isPremium();
    console.log('usePermissions: canAccessPremiumFeatures check:', { isAdmin, isPremium: isPremium(), result });
    return result;
  };

  const getAvailableFeatures = () => {
    if (isAdmin) {
      return ['clientes', 'orcamentos', 'servicos', 'relatorios_basicos', 'diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados', 'agendamentos', 'backup_automatico', 'integracao_contabil'];
    }
    
    if (!planActive) {
      return ['clientes', 'orcamentos']; // Recursos básicos para plano inativo
    }
    
    return permissions;
  };

  const getPlanFeatures = () => {
    const features = {
      Free: [
        'Gestão básica de clientes',
        'Orçamentos simples'
      ],
      Essencial: [
        'Gestão de clientes',
        'Orçamentos digitais',
        'Controle de serviços',
        'Relatórios básicos',
        'Suporte por email',
        'Backup automático'
      ],
      Premium: [
        'Todos os recursos do Essencial',
        'IA para diagnóstico',
        'Agendamentos inteligentes',
        'Relatórios avançados',
        'Marketing automático',
        'Suporte prioritário',
        'Integração contábil'
      ]
    };

    return features[plan as keyof typeof features] || features.Free;
  };

  console.log('usePermissions: Estado atual:', {
    plan,
    planActive,
    isAdmin,
    permissionsCount: permissions.length,
    isPremium: isPremium(),
    isEssencial: isEssencial(),
    hasIADiagnostico: hasPermission('diagnostico_ia'),
    hasMarketing: hasPermission('campanhas_marketing')
  });

  return {
    hasPermission,
    isPremium,
    isEssencial,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  };
};
