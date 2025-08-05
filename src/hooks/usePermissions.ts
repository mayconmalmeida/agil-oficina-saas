
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
      hasFeature: permissions.includes(feature) || permissions.includes('*')
    });

    // ✅ CORRIGIDO: Admin tem todas as permissões - verificação mais robusta
    if (isAdmin === true) {
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
    // ✅ Admin sempre tem acesso premium
    if (isAdmin === true) return true;
    const result = plan === 'Premium' && planActive;
    console.log('usePermissions: isPremium check:', { plan, planActive, isAdmin, result });
    return result;
  };

  const isEssencial = (): boolean => {
    // ✅ Admin sempre tem acesso, mas pode retornar false para isPremium lógica
    const result = plan === 'Essencial' && planActive;
    console.log('usePermissions: isEssencial check:', { plan, planActive, result });
    return result;
  };

  const isEnterprise = (): boolean => {
    // ✅ Admin sempre tem acesso enterprise se implementado
    if (isAdmin === true) return true;
    const result = false; // Enterprise não implementado ainda
    console.log('usePermissions: isEnterprise check:', { plan, planActive, result });
    return result;
  };

  const canAccessPremiumFeatures = (): boolean => {
    const result = isAdmin === true || isPremium() || isEnterprise();
    console.log('usePermissions: canAccessPremiumFeatures check:', { isAdmin, isPremium: isPremium(), result });
    return result;
  };

  const canAccessEnterpriseFeatures = (): boolean => {
    const result = isAdmin === true || isEnterprise();
    console.log('usePermissions: canAccessEnterpriseFeatures check:', { isAdmin, isEnterprise: isEnterprise(), result });
    return result;
  };

  const getAvailableFeatures = () => {
    if (isAdmin === true) {
      return ['*']; // Admin tem todas as funcionalidades
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
        'Backup automático',
        'IA para Suporte Inteligente'
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
    isEnterprise: isEnterprise(),
    hasIADiagnostico: hasPermission('diagnostico_ia'),
    hasMarketing: hasPermission('marketing_automatico')
  });

  return {
    hasPermission,
    isPremium,
    isEssencial,
    isEnterprise,
    canAccessPremiumFeatures,
    canAccessEnterpriseFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  };
};
