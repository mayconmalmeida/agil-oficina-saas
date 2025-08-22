
import React, { useMemo, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();
  const lastCheckRef = useRef<{ path: string; userId: string; result: string } | null>(null);

  // Verificação única por navegação usando useMemo
  const access = useMemo(() => {
    const currentPath = location.pathname;
    const currentUserId = user?.id || 'no-user';
    const checkKey = `${currentPath}-${currentUserId}-${isLoadingAuth}`;

    // Se já fizemos esta verificação para este usuário nesta rota, retornar resultado
    if (lastCheckRef.current?.path === currentPath && 
        lastCheckRef.current?.userId === currentUserId && 
        !isLoadingAuth) {
      return lastCheckRef.current.result;
    }

    console.log('ProtectedRoute: Verificação única de acesso', {
      isLoadingAuth,
      hasUser: !!user,
      userEmail: user?.email || 'não logado',
      currentPath,
      userRole: user?.role || 'sem role'
    });

    let result: string;

    if (isLoadingAuth) {
      result = 'loading';
    } else if (!user) {
      result = 'redirect';
    } else {
      result = 'allowed';
    }

    // Salvar resultado no cache apenas se não estiver carregando
    if (!isLoadingAuth) {
      lastCheckRef.current = {
        path: currentPath,
        userId: currentUserId,
        result
      };
    }

    return result;
  }, [isLoadingAuth, user?.id, location.pathname]);

  if (access === 'loading') {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  if (access === 'redirect') {
    console.log('ProtectedRoute: Redirecionando para login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('ProtectedRoute: Acesso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;
