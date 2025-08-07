
import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutePersistence } from '@/hooks/useRoutePersistence';
import { useAuth } from '@/contexts/AuthContext';

interface RouteManagerProps {
  children: React.ReactNode;
}

const RouteManager: React.FC<RouteManagerProps> = ({ children }) => {
  const location = useLocation();
  const { saveLastRoute } = useRoutePersistence();
  const { isLoadingAuth, user } = useAuth();
  const lastProcessedRoute = useRef<string>('');
  const processingRoute = useRef<boolean>(false);
  const lastLogRef = useRef<string>('');

  // Memoizar as condições para evitar recálculos desnecessários
  const shouldProcessRoute = useMemo(() => {
    return !isLoadingAuth && !!user;
  }, [isLoadingAuth, user?.id]);

  const isSkipRoute = useMemo(() => {
    const skipRoutes = ['/', '/home', '/login', '/register', '/plano-expirado'];
    return skipRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Processar rota apenas quando necessário
  useEffect(() => {
    // Evitar processamento múltiplo da mesma rota
    if (processingRoute.current || lastProcessedRoute.current === location.pathname) {
      return;
    }

    // Só salvar rotas se condições básicas forem atendidas
    if (shouldProcessRoute && !isSkipRoute) {
      processingRoute.current = true;
      
      lastProcessedRoute.current = location.pathname;
      saveLastRoute(location.pathname);
      
      // Evitar logs duplicados
      const logKey = `route-${location.pathname}`;
      if (lastLogRef.current !== logKey) {
        console.log('RouteManager: Rota processada uma única vez:', location.pathname);
        lastLogRef.current = logKey;
      }
      
      // Reset do flag após um pequeno delay
      setTimeout(() => {
        processingRoute.current = false;
      }, 100);
    }
  }, [location.pathname, shouldProcessRoute, isSkipRoute, saveLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
