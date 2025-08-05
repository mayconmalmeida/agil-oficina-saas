
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface PlanExpiredGuardProps {
  children: React.ReactNode;
}

const PlanExpiredGuard: React.FC<PlanExpiredGuardProps> = ({ children }) => {
  const { user, isLoadingAuth, isAdmin, planActive } = useAuth();

  // Memoizar a decisão para evitar re-renders desnecessários
  const accessDecision = useMemo(() => {
    console.log('PlanExpiredGuard: Verificando acesso uma única vez', {
      hasUser: !!user,
      isAdmin,
      planActive,
      isLoadingAuth
    });

    if (isLoadingAuth) {
      return 'loading';
    }

    if (!user) {
      return 'login';
    }

    if (isAdmin) {
      console.log('PlanExpiredGuard: Admin detectado, liberando acesso');
      return 'allowed';
    }

    if (!planActive) {
      console.log('PlanExpiredGuard: Plano inativo, redirecionando para /plano-expirado');
      return 'expired';
    }

    console.log('PlanExpiredGuard: Acesso liberado, plano ativo');
    return 'allowed';
  }, [user, isLoadingAuth, isAdmin, planActive]);

  if (accessDecision === 'loading') {
    return <Loading fullscreen text="Verificando plano..." />;
  }

  if (accessDecision === 'login') {
    return <Navigate to="/login" replace />;
  }

  if (accessDecision === 'expired') {
    return <Navigate to="/plano-expirado" replace />;
  }

  return <>{children}</>;
};

export default PlanExpiredGuard;
