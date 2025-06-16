
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

interface AccessControlProps {
  requiredPlan?: 'essencial' | 'premium';
}

export const useAccessControl = ({ requiredPlan }: AccessControlProps = {}) => {
  const { user, loading: isLoadingAuth, role } = useAuth();
  const location = useLocation();

  const result = useMemo(() => {
    const userId = user?.id;
    const pathname = location.pathname;

    // Se ainda está carregando, aguardar
    if (isLoadingAuth) {
      console.log('[useAccessControl] Aguardando carregamento da autenticação...');
      return {
        canAccess: false,
        isLoadingAuth: true,
        reason: 'loading'
      };
    }

    // Se não há usuário, não pode acessar
    if (!user || !userId) {
      console.log('[useAccessControl] Usuário não autenticado');
      return {
        canAccess: false,
        isLoadingAuth: false,
        reason: 'not_authenticated'
      };
    }

    // Admin sempre pode acessar tudo
    if (role === 'admin' || role === 'superadmin') {
      console.log('[useAccessControl] Admin detectado, acesso liberado');
      return {
        canAccess: true,
        isLoadingAuth: false,
        reason: 'admin'
      };
    }

    // Usuário comum sempre pode acessar funcionalidades básicas
    if (role === 'user') {
      console.log('[useAccessControl] Usuário comum autenticado, acesso básico liberado');
      return {
        canAccess: true,
        isLoadingAuth: false,
        reason: 'user'
      };
    }

    // Fallback: permitir acesso
    return {
      canAccess: true,
      isLoadingAuth: false,
      reason: 'fallback'
    };
  }, [user, isLoadingAuth, role, location.pathname, requiredPlan]);

  return result;
};
