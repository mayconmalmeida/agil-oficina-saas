
import React, { useEffect, useRef } from 'react';
import { useRoutePersistence } from '@/hooks/useRoutePersistence';
import { useAuth } from '@/contexts/AuthContext';

interface RouteManagerProps {
  children: React.ReactNode;
}

const RouteManager: React.FC<RouteManagerProps> = ({ children }) => {
  const { restoreLastRoute } = useRoutePersistence();
  const { isLoadingAuth, user } = useAuth();
  const hasTriedRestore = useRef(false);

  // Tentar restaurar a última rota apenas quando a autenticação estiver carregada
  useEffect(() => {
    // Só tentar restaurar se:
    // 1. Não está mais carregando autenticação
    // 2. Ainda não tentou restaurar
    // 3. Há um usuário autenticado
    if (!isLoadingAuth && !hasTriedRestore.current && user) {
      hasTriedRestore.current = true;
      
      // Pequeno delay para garantir que outros componentes tenham carregado
      const timer = setTimeout(() => {
        restoreLastRoute();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoadingAuth, user, restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
