
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Evitar processamento múltiplo da mesma rota
    if (processingRoute.current || lastProcessedRoute.current === location.pathname) {
      return;
    }

    // Só salvar rotas se condições básicas forem atendidas
    if (!isLoadingAuth && user) {
      processingRoute.current = true;
      
      const skipRoutes = ['/', '/home', '/login', '/register', '/plano-expirado'];
      
      if (!skipRoutes.includes(location.pathname)) {
        lastProcessedRoute.current = location.pathname;
        saveLastRoute(location.pathname);
        console.log('RouteManager: Rota processada uma única vez:', location.pathname);
      }
      
      // Reset do flag após um pequeno delay
      setTimeout(() => {
        processingRoute.current = false;
      }, 100);
    }
  }, [location.pathname, isLoadingAuth, user, saveLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
