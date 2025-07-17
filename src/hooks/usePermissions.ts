
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, plan, planActive, isAdmin } = useAuth();

  const hasPermission = (feature: string): boolean => {
    // Admin tem todas as permissões
    if (isAdmin) return true;
    
    // Se o plano não está ativo, apenas permissões básicas
    if (!planActive) {
      const basicPermissions = ['clientes', 'orcamentos'];
      return basicPermissions.includes(feature);
    }

    // Verificar se tem a permissão específica
    return permissions.includes(feature) || permissions.includes('*');
  };

  const isPremium = (): boolean => {
    return plan === 'Premium' && planActive;
  };

  const isEssencial = (): boolean => {
    return plan === 'Essencial' && planActive;
  };

  const canAccessPremiumFeatures = (): boolean => {
    return isAdmin || isPremium();
  };

  const getAvailableFeatures = () => {
    if (!planActive) {
      return ['clientes', 'orcamentos'];
    }
    return permissions;
  };

  console.log('usePermissions: Estado atual:', {
    plan,
    planActive,
    isAdmin,
    permissionsCount: permissions.length,
    isPremium: isPremium(),
    isEssencial: isEssencial()
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
