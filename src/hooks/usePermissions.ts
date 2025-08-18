
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

  const canAccessPremiumFeatures = (): boolean => {
    const result = isAdmin === true || isPremium();
    console.log('usePermissions: canAccessPremiumFeatures check:', { isAdmin, isPremium: isPremium(), result });
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
  };

  console.log('usePermissions: Estado atual:', {
    plan,
    planActive,
    isAdmin,
    permissionsCount: permissions.length,
    isPremium: isPremium(),
    hasIADiagnostico: hasPermission('diagnostico_ia'),
    hasMarketing: hasPermission('marketing_automatico')
  });

  return {
    hasPermission,
    isPremium,
    canAccessPremiumFeatures,
    getAvailableFeatures,
    getPlanFeatures,
    permissions,
    plan,
    planActive
  };
};
