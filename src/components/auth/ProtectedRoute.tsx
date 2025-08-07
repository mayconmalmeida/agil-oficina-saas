
import React, { useMemo, useRef, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();
  const location = useLocation();
  const lastDecisionRef = useRef<string>('');
  const lastLogRef = useRef<string>('');

  // Memoizar o resultado para evitar re-renders desnecessários
  const authDecision = useMemo(() => {
    const decisionKey = `${isLoadingAuth}-${user?.id}-${location.pathname}`;
    
    // Evitar logs duplicados
    if (lastLogRef.current !== decisionKey) {
      console.log('ProtectedRoute: Verificando acesso uma única vez', {
        isLoadingAuth,
        hasUser: !!user,
        userEmail: user?.email || 'não logado',
        currentPath: location.pathname,
        userRole: user?.role || 'sem role'
      });
      lastLogRef.current = decisionKey;
    }

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
  }, [isLoadingAuth, user?.id, location.pathname]); // Dependências mais específicas

  // Evitar re-renderizações desnecessárias
  useEffect(() => {
    const currentDecision = `${authDecision}-${user?.id}-${location.pathname}`;
    if (lastDecisionRef.current === currentDecision) {
      return;
    }
    lastDecisionRef.current = currentDecision;
  }, [authDecision, user?.id, location.pathname]);

  if (authDecision === 'loading') {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  if (authDecision === 'redirect') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
