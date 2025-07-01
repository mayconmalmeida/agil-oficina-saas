
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
    hasUser: !!user,
    userEmail: user?.email || 'não logado',
    currentPath: location.pathname,
    userRole: user?.role || 'sem role'
  });

  // Aguardar o carregamento completo da autenticação por no máximo 5 segundos
  if (isLoadingAuth) {
    console.log('ProtectedRoute: Carregando autenticação...');
    
    // Timeout de segurança para evitar loading infinito
    setTimeout(() => {
      if (isLoadingAuth) {
        console.log('ProtectedRoute: Timeout de loading atingido, forçando verificação');
      }
    }, 5000);
    
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  // Verificação simples e direta
  if (!user) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando');
    // Usar replace para evitar loops de navegação
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('ProtectedRoute: Acesso permitido para usuário:', user.email);
  return <>{children}</>;
};

export default ProtectedRoute;
