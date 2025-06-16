
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
    // Aguardar a autenticação estar completamente carregada
    if (isLoadingAuth) {
      console.log('RouteManager: Aguardando carregamento da autenticação...');
      return;
    }

    // Múltiplas proteções contra execução desnecessária
    if (hasTriedRestore.current || 
        isRestoring.current || 
        !user) {
      return;
    }

    hasTriedRestore.current = true;
    isRestoring.current = true;
    
    console.log('RouteManager: Iniciando restauração de rota');
    
    // Delay para garantir que tudo esteja carregado
    const timer = setTimeout(() => {
      try {
        restoreLastRoute();
      } catch (error) {
        console.error('Erro ao restaurar rota:', error);
      } finally {
        isRestoring.current = false;
      }
    }, 1000); // Reduzido para 1s

    return () => {
      clearTimeout(timer);
      isRestoring.current = false;
    };
  }, [isLoadingAuth, user, restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
