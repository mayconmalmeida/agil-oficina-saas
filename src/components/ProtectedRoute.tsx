
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Verificando acesso', {
    isLoadingAuth,
    hasUser: !!user,
    userEmail: user?.email || 'não logado',
    currentPath: location.pathname
  });

  // Aguardar o carregamento completo da autenticação
  if (isLoadingAuth) {
    console.log('ProtectedRoute: Carregando autenticação...');
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  // Verificação simples e direta
  if (!user) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando');
    // Usar replace para evitar loops de navegação
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('ProtectedRoute: Acesso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;
