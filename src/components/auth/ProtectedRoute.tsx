
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();
  const [forceLoad, setForceLoad] = useState(false);

  console.log('ProtectedRoute: Verificando acesso', {
    isLoadingAuth,
    hasUser: !!user,
    userEmail: user?.email || 'não logado',
    currentPath: location.pathname,
    userRole: user?.role || 'sem role',
    forceLoad
  });

  // Timeout de segurança mais agressivo para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('ProtectedRoute: Timeout de loading atingido, forçando verificação');
      setForceLoad(true);
    }, 2000); // Reduzido para 2 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Se forçou o carregamento ou não está mais carregando
  if (forceLoad || !isLoadingAuth) {
    console.log('ProtectedRoute: Verificação de acesso final', {
      hasUser: !!user,
      forceLoad,
      isLoadingAuth
    });

    // Verificação simples e direta
    if (!user) {
      console.log('ProtectedRoute: Usuário não autenticado, redirecionando');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    console.log('ProtectedRoute: Acesso permitido para usuário:', user.email);
    return <>{children}</>;
  }

  // Aguardar o carregamento completo da autenticação
  console.log('ProtectedRoute: Carregando autenticação...');
  return <Loading fullscreen text="Verificando autenticação..." />;
};

export default ProtectedRoute;
