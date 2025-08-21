
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, plan, planActive, isAdmin } = useAuth();

  // Memoizar a função hasPermission para evitar re-criação em cada render
  const hasPermission = useMemo(() => {
    return (feature: string): boolean => {
      console.log('usePermissions: Verificando permissão (cached):', {
        feature,
        isAdmin,
        plan,
        planActive,
        permissions: permissions.length,
        hasFeature: permissions.includes(feature) || permissions.includes('*')
      });

      // ✅ Admin tem todas as permissões
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
  }, [permissions, plan, planActive, isAdmin]); // Dependências estáveis

  // Memoizar isPremium para evitar recálculos desnecessários
  const isPremium = useMemo(() => {
    return (): boolean => {
      // ✅ Admin sempre tem acesso premium
      if (isAdmin === true) return true;
      const result = plan === 'Premium' && planActive;
      console.log('usePermissions: isPremium check (cached):', { plan, planActive, isAdmin, result });
      return result;
    };
  }, [plan, planActive, isAdmin]);

  // Memoizar canAccessPremiumFeatures
  const canAccessPremiumFeatures = useMemo(() => {
    return (): boolean => {
      const premiumAccess = isPremium();
      const result = isAdmin === true || premiumAccess;
      console.log('usePermissions: canAccessPremiumFeatures check (cached):', { isAdmin, isPremium: premiumAccess, result });
      return result;
    };
  }, [isAdmin, isPremium]);

  // Memoizar getAvailableFeatures
  const getAvailableFeatures = useMemo(() => {
    if (isAdmin === true) {
      return ['*']; // Admin tem todas as funcionalidades
    }
    
    if (!planActive) {
      return ['clientes', 'orcamentos']; // Recursos básicos para plano inativo
    }
    
    return permissions;
  }, [isAdmin, planActive, permissions]);

  // Memoizar getPlanFeatures
  const getPlanFeatures = useMemo(() => {
    const features = {
      Free: [
        'Gestão básica de clientes',
        'Orçamentos simples'
      ],
      Premium: [
        'Gestão de clientes',
        'Orçamentos digitais',
        'Controle de serviços',
        'IA para diagnóstico',
        'Agendamentos inteligentes',
        'Relatórios avançados',
        'Marketing automático',
        'Suporte prioritário',
        'Integração contábil',
        'Backup automático'
      ]
    };

    return features[plan as keyof typeof features] || features.Free;
  }, [plan]);

  // Log único com estado atual (sem causar re-renders)
  console.log('usePermissions: Estado atual (memoizado):', {
    plan,
    planActive,
    isAdmin,
    permissionsCount: permissions.length,
    isPremium: isPremium(),
    hasIADiagnostico: hasPermission('diagnostico_ia'),
    hasMarketing: hasPermission('marketing_automatico')
  });

  // Retornar objeto memoizado para evitar re-criação
  return useMemo(() => ({
    hasPermission,
    isPremium,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  }), [
    hasPermission,
    isPremium,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  ]);
};
