
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

    console.log('[useAccessControl] INICIO', {
      userId,
      isLoadingAuth,
      requiredPlan,
      pathname
    });

    // Se ainda está carregando, aguardar
    if (isLoadingAuth) {
      console.log('[useAccessControl] Aguardando carregamento da autenticação...');
      return {
        canAccess: false,
        isLoadingAuth: true,
        reason: 'loading',
        shouldShowContent: false,
        isAdmin: false,
        hasGeneralAccess: false
      };
    }

    // Se não há usuário, não pode acessar
    if (!user || !userId) {
      console.log('[useAccessControl] Usuário não autenticado');
      return {
        canAccess: false,
        isLoadingAuth: false,
        reason: 'not_authenticated',
        shouldShowContent: false,
        isAdmin: false,
        hasGeneralAccess: false
      };
    }

    // Admin sempre pode acessar tudo
    if (role === 'admin' || role === 'superadmin') {
      console.log('[useAccessControl] Admin detectado, acesso liberado');
      return {
        canAccess: true,
        isLoadingAuth: false,
        reason: 'admin',
        shouldShowContent: true,
        isAdmin: true,
        hasGeneralAccess: true
      };
    }

    // Usuário comum sempre pode acessar funcionalidades básicas
    if (role === 'user') {
      console.log('[useAccessControl] Usuário comum autenticado (role=user ou canAccessFeatures), acesso ok');
      return {
        canAccess: true,
        isLoadingAuth: false,
        reason: 'user',
        shouldShowContent: true,
        isAdmin: false,
        hasGeneralAccess: true
      };
    }

    // Fallback: permitir acesso
    return {
      canAccess: true,
      isLoadingAuth: false,
      reason: 'fallback',
      shouldShowContent: true,
      isAdmin: false,
      hasGeneralAccess: true
    };
  }, [user, isLoadingAuth, role, location.pathname, requiredPlan]);

  return result;
};
