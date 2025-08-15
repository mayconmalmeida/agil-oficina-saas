
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { MenuItem, getAllMenuItems } from '@/config/menuConfig';

export const useMenuPermissions = () => {
  const { plan, planActive, isAdmin } = useAuth();
  const { hasPermission, isPremium, canAccessPremiumFeatures } = usePermissions();
  const { isPremiumTrial, diasRestantes } = useDaysRemaining();

  const filteredMenuItems = useMemo(() => {
    const allItems = getAllMenuItems();
    
    // Admin tem acesso a tudo
    if (isAdmin) {
      console.log('useMenuPermissions: Admin detectado, liberando todos os menus');
      return allItems;
    }

    return allItems.filter(item => {
      // Items básicos sempre acessíveis
      if (!item.isPremium && !item.requiredPlan && !item.requiredPermission) {
        return true;
      }

      // Verificar permissão específica se definida
      if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
        console.log(`useMenuPermissions: Sem permissão para ${item.name}:`, item.requiredPermission);
        return false;
      }

      // Verificar plano necessário
      if (item.requiredPlan) {
        if (item.requiredPlan === 'premium') {
          // Durante trial premium, usuário tem acesso
          const hasAccessToPremium = isPremium() || (isPremiumTrial && diasRestantes > 0);
          if (!hasAccessToPremium) {
            console.log(`useMenuPermissions: Sem acesso premium para ${item.name}`);
            return false;
          }
        }
        
        if (item.requiredPlan === 'essencial') {
          if (!planActive) {
            console.log(`useMenuPermissions: Plano não ativo para ${item.name}`);
            return false;
          }
        }
      }

      // Item premium genérico
      if (item.isPremium && !canAccessPremiumFeatures()) {
        console.log(`useMenuPermissions: Sem acesso a recursos premium para ${item.name}`);
        return false;
      }

      return true;
    });
  }, [plan, planActive, isAdmin, hasPermission, isPremium, canAccessPremiumFeatures, isPremiumTrial, diasRestantes]);

  const getMenuAccessInfo = (item: MenuItem) => {
    if (isAdmin) return { canAccess: true, reason: 'admin' };
    
    if (item.isPremium || item.requiredPlan === 'premium') {
      const hasAccessToPremium = isPremium() || (isPremiumTrial && diasRestantes > 0);
      return { 
        canAccess: hasAccessToPremium, 
        reason: hasAccessToPremium ? 'premium_access' : 'premium_required',
        isTrialAccess: isPremiumTrial && diasRestantes > 0
      };
    }

    if (item.requiredPermission) {
      const hasAccess = hasPermission(item.requiredPermission);
      return { 
        canAccess: hasAccess, 
        reason: hasAccess ? 'permission_granted' : 'permission_required' 
      };
    }

    return { canAccess: true, reason: 'basic_access' };
  };

  console.log('useMenuPermissions: Menu filtrado:', {
    totalItems: getAllMenuItems().length,
    filteredItems: filteredMenuItems.length,
    plan,
    planActive,
    isAdmin,
    isPremiumTrial,
    diasRestantes
  });

  return {
    filteredMenuItems,
    getMenuAccessInfo,
    isPremiumTrial,
    diasRestantes
  };
};
