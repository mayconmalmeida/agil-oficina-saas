
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
    if (!planActive) {
      return ['clientes', 'orcamentos']; // Recursos básicos
    }
    return permissions;
  };

  console.log('usePermissions: Estado atual:', {
    plan,
    planActive,
    isAdmin,
    permissionsCount: permissions.length,
    isPremium: isPremium(),
    isEssencial: isEssencial(),
    hasIADiagnostico: hasPermission('diagnostico_ia')
  });

  return {
    hasPermission,
    isPremium,
    isEssencial,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    permissions,
    plan,
    planActive
  };
};
