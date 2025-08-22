
import { useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { permissions, plan, planActive, isAdmin } = useAuth();
  const cacheRef = useRef<{ 
    key: string; 
    result: any;
  } | null>(null);

  // Criar chave única para cache baseada nos valores essenciais
  const cacheKey = `${isAdmin}-${plan}-${planActive}-${permissions.length}-${permissions.join(',')}`;

  // Memoizar todas as funções e valores para evitar recriação
  const memoizedPermissions = useMemo(() => {
    // Se já temos o resultado em cache para esta chave, retornar
    if (cacheRef.current?.key === cacheKey) {
      return cacheRef.current.result;
    }

    console.log('usePermissions: Recalculando permissões (cache miss):', {
      isAdmin,
      plan,
      planActive,
      permissionsCount: permissions.length
    });

    // Função hasPermission memoizada
    const hasPermission = (feature: string): boolean => {
      // Admin tem todas as permissões
      if (isAdmin === true) {
        return true;
      }
      
      // Se o plano não está ativo, só permite recursos básicos
      if (!planActive) {
        return ['clientes', 'orcamentos'].includes(feature);
      }

      // Verificar se tem a permissão específica
      return permissions.includes(feature) || permissions.includes('*');
    };

    // Função isPremium memoizada
    const isPremium = (): boolean => {
      // Admin sempre tem acesso premium
      if (isAdmin === true) return true;
      return plan === 'Premium' && planActive;
    };

    // Função canAccessPremiumFeatures memoizada
    const canAccessPremiumFeatures = (): boolean => {
      return isAdmin === true || isPremium();
    };

    // Array getAvailableFeatures memoizado
    const getAvailableFeatures = (() => {
      if (isAdmin === true) {
        return ['*']; // Admin tem todas as funcionalidades
      }
      
      if (!planActive) {
        return ['clientes', 'orcamentos']; // Recursos básicos para plano inativo
      }
      
      return permissions;
    })();

    // Array getPlanFeatures memoizado
    const getPlanFeatures = (() => {
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
    })();

    const result = {
      hasPermission,
      isPremium,
      canAccessPremiumFeatures,
      getAvailableFeatures,
      getPlanFeatures,
      permissions,
      plan,
      planActive
    };

    // Salvar no cache
    cacheRef.current = {
      key: cacheKey,
      result
    };

    return result;
  }, [cacheKey, permissions, plan, planActive, isAdmin]);

  return memoizedPermissions;
};
