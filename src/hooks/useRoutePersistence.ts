
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);
  const lastSavedRoute = useRef<string>('');

  // Salvar a rota atual automaticamente apenas quando necessário
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Evitar salvar a mesma rota repetidamente
    if (lastSavedRoute.current === currentPath) {
      return;
    }
    
    // Não salvar certas rotas específicas
    const routesToIgnore = ['/login', '/register', '/admin/login', '/', '/home'];
    
    if (!routesToIgnore.includes(currentPath)) {
      lastSavedRoute.current = currentPath;
      localStorage.setItem('lastRoute', currentPath);
      console.log('Rota salva uma única vez:', currentPath);
    }
  }, [location.pathname]);

  // Função para salvar rota manualmente (otimizada)
  const saveLastRoute = (route: string) => {
    // Evitar salvar a mesma rota repetidamente
    if (lastSavedRoute.current === route) {
      return;
    }

    const routesToIgnore = ['/login', '/register', '/admin/login', '/', '/home', '/plano-expirado'];
    
    if (!routesToIgnore.includes(route)) {
      lastSavedRoute.current = route;
      localStorage.setItem('lastRoute', route);
      console.log('Rota salva manualmente uma única vez:', route);
    }
  };

  // Restaurar rota apenas se necessário
  const restoreLastRoute = () => {
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

  return { restoreLastRoute, saveLastRoute };
};
