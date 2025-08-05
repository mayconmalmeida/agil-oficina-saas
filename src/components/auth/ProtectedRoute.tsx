
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();

  // Memoizar o resultado para evitar re-renders desnecessários
  const authDecision = useMemo(() => {
    console.log('ProtectedRoute: Verificando acesso uma única vez', {
      isLoadingAuth,
      hasUser: !!user,
      userEmail: user?.email || 'não logado',
      currentPath: location.pathname,
      userRole: user?.role || 'sem role'
    });

    if (isLoadingAuth) {
      console.log('ProtectedRoute: Carregando autenticação...');
      return 'loading';
    }

    if (!user) {
      console.log('ProtectedRoute: Usuário não autenticado, redirecionando para login');
      return 'redirect';
    }

    console.log('ProtectedRoute: Acesso permitido para usuário:', user.email);
    return 'allowed';
  }, [isLoadingAuth, user, location.pathname]);

  if (authDecision === 'loading') {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  if (authDecision === 'redirect') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
