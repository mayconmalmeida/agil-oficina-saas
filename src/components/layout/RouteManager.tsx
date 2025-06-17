
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
    // Só tentar restaurar se:
    // 1. Não está carregando autenticação
    // 2. Usuário está logado
    // 3. Ainda não tentou restaurar
    // 4. Está na rota raiz (/)
    if (!isLoadingAuth && user && !hasTriedRestore.current && window.location.pathname === '/') {
      hasTriedRestore.current = true;
      
      // Pequeno delay para garantir que o contexto está totalmente carregado
      setTimeout(() => {
        try {
          restoreLastRoute();
        } catch (error) {
          console.error('Erro ao restaurar rota:', error);
        }
      }, 100);
    }
  }, [isLoadingAuth, user, restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
