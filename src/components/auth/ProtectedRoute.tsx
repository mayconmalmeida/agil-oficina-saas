
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Verificando acesso', {
    isLoadingAuth,
    user: user?.email || 'não logado',
    currentPath: location.pathname
  });

  if (isLoadingAuth) {
    console.log('ProtectedRoute: Ainda carregando autenticação...');
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  if (!user) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Usuário autenticado, permitindo acesso');
  return <>{children}</>;
};

export default ProtectedRoute;
