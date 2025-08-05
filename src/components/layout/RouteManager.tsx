
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
  const lastSavedRoute = useRef<string>('');

  useEffect(() => {
    // Só salvar rotas se:
    // 1. Não está carregando autenticação
    // 2. Usuário está logado
    // 3. A rota atual é diferente da última salva
    // 4. Não é uma rota de redirecionamento (/) ou home
    if (!isLoadingAuth && user && location.pathname !== lastSavedRoute.current) {
      // Não salvar rotas de redirecionamento ou páginas públicas
      const skipRoutes = ['/', '/home', '/login', '/register', '/plano-expirado'];
      
      if (!skipRoutes.includes(location.pathname)) {
        lastSavedRoute.current = location.pathname;
        saveLastRoute(location.pathname);
        console.log('Rota salva:', location.pathname);
      }
    }
  }, [location.pathname, isLoadingAuth, user, saveLastRoute]);

  return <>{children}</>;
};

export default RouteManager;
