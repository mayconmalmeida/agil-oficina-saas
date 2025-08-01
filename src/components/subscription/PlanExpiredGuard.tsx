
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface PlanExpiredGuardProps {
  children: React.ReactNode;
}

const PlanExpiredGuard: React.FC<PlanExpiredGuardProps> = ({ children }) => {
  const { user, isLoadingAuth, isAdmin, planActive } = useAuth();

  console.log('PlanExpiredGuard: Verificando acesso', {
    hasUser: !!user,
    isAdmin,
    planActive,
    isLoadingAuth
  });

  // Aguardar carregamento
  if (isLoadingAuth) {
    return <Loading fullscreen text="Verificando plano..." />;
  }

  // Se não há usuário autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin sempre tem acesso total
  if (isAdmin) {
    console.log('PlanExpiredGuard: Admin detectado, liberando acesso');
    return <>{children}</>;
  }

  // Se o plano não está ativo, redirecionar para página de plano expirado
  if (!planActive) {
    console.log('PlanExpiredGuard: Plano inativo, redirecionando para /plano-expirado');
    return <Navigate to="/plano-expirado" replace />;
  }

  console.log('PlanExpiredGuard: Acesso liberado, plano ativo');
  return <>{children}</>;
};

export default PlanExpiredGuard;
