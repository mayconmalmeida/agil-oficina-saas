
import { useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);
  const lastSavedRoute = useRef<string>('');
  const lastLogRef = useRef<string>('');
  const lastStateRef = useRef<string>('');

  // Memoizar as rotas que devem ser ignoradas
  const routesToIgnore = useMemo(() => {
    return ['/login', '/register', '/admin/login', '/', '/home', '/plano-expirado'];
  }, []);

  // Memoizar a função de salvar rota
  const saveLastRoute = useMemo(() => {
    return (route: string) => {
      // Evitar salvar a mesma rota repetidamente
      if (lastSavedRoute.current === route) {
        return;
      }

      if (!routesToIgnore.includes(route)) {
        lastSavedRoute.current = route;
        localStorage.setItem('lastRoute', route);
        
        // Evitar logs duplicados
        const logKey = `manual-${route}`;
        if (lastLogRef.current !== logKey) {
          console.log('Rota salva manualmente uma única vez:', route);
          lastLogRef.current = logKey;
        }
      }
    };
  }, [routesToIgnore]);

  // Memoizar a função de restaurar rota
  const restoreLastRoute = useMemo(() => {
    return () => {
      if (hasRestored.current) {
        return;
      }
      
      const lastRoute = localStorage.getItem('lastRoute');
      const currentPath = window.location.pathname;
      
      console.log('Verificando restauração:', { lastRoute, currentPath });
      
      if (lastRoute && 
          currentPath === '/' && 
          lastRoute !== '/' &&
          !lastRoute.includes('/login') &&
          !lastRoute.includes('/register') &&
          !lastRoute.includes('/admin/login')) {
        
        hasRestored.current = true;
        console.log('Restaurando rota para:', lastRoute);
        navigate(lastRoute, { replace: true });
      }
    };
  }, [navigate]);

  // Salvar a rota atual automaticamente apenas quando necessário
  useEffect(() => {
    const currentPath = location.pathname;
    const currentState = `${currentPath}-${routesToIgnore.includes(currentPath)}`;
    
    // Evitar re-renderizações desnecessárias
    if (lastStateRef.current === currentState) {
      return;
    }
    lastStateRef.current = currentState;
    
    // Evitar salvar a mesma rota repetidamente
    if (lastSavedRoute.current === currentPath) {
      return;
    }
    
    if (!routesToIgnore.includes(currentPath)) {
      lastSavedRoute.current = currentPath;
      localStorage.setItem('lastRoute', currentPath);
      
      // Evitar logs duplicados
      const logKey = `save-${currentPath}`;
      if (lastLogRef.current !== logKey) {
        console.log('Rota salva uma única vez:', currentPath);
        lastLogRef.current = logKey;
      }
    }
  }, [location.pathname]); // Removida dependência routesToIgnore para evitar loop

  return { restoreLastRoute, saveLastRoute };
};
