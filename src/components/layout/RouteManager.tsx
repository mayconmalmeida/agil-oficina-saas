
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
  const isRestoring = useRef(false);

  useEffect(() => {
    // Múltiplas proteções contra execução desnecessária
    if (hasTriedRestore.current || 
        isRestoring.current || 
        isLoadingAuth || 
        !user) {
      return;
    }

    hasTriedRestore.current = true;
    isRestoring.current = true;
    
    console.log('RouteManager: Iniciando restauração de rota');
    
    // Delay maior para garantir que tudo esteja carregado
    const timer = setTimeout(() => {
      try {
        restoreLastRoute();
      } catch (error) {
        console.error('Erro ao restaurar rota:', error);
      } finally {
        isRestoring.current = false;
      }
    }, 1500); // Aumentado para 1.5s

    return () => {
      clearTimeout(timer);
      isRestoring.current = false;
    };
  }, [isLoadingAuth, user, restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
