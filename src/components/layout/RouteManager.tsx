
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

  useEffect(() => {
    // Se ainda está carregando ou não há usuário, não fazer nada
    if (isLoadingAuth || !user) {
      return;
    }

    // Se já tentou restaurar, não tentar novamente
    if (hasTriedRestore.current) {
      return;
    }

    hasTriedRestore.current = true;
    
    // Restaurar rota imediatamente sem delay desnecessário
    try {
      restoreLastRoute();
    } catch (error) {
      console.error('Erro ao restaurar rota:', error);
    }
  }, [isLoadingAuth, user, restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
