
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRestored = useRef(false);

  // Salvar a rota atual automaticamente
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Não salvar certas rotas específicas
    const routesToIgnore = ['/login', '/register', '/admin/login'];
    
    if (!routesToIgnore.includes(currentPath)) {
      localStorage.setItem('lastRoute', currentPath);
      console.log('Rota salva:', currentPath);
    }
  }, [location.pathname]);

  // Função para salvar rota manualmente
  const saveLastRoute = (route: string) => {
    const routesToIgnore = ['/login', '/register', '/admin/login', '/', '/home', '/plano-expirado'];
    
    if (!routesToIgnore.includes(route)) {
      localStorage.setItem('lastRoute', route);
      console.log('Rota salva manualmente:', route);
    }
  };

  // Restaurar rota apenas se necessário (quando está na home e há rota salva)
  const restoreLastRoute = () => {
    // Evitar múltiplas execuções
    if (hasRestored.current) {
      console.log('Rota já foi restaurada anteriormente');
      return;
    }
    
    const lastRoute = localStorage.getItem('lastRoute');
    const currentPath = window.location.pathname;
    
    console.log('Verificando restauração:', { lastRoute, currentPath });
    
    // Só restaurar se estiver na home (/) e houver uma rota válida salva
    if (lastRoute && 
        currentPath === '/' && 
        lastRoute !== '/' &&
        !lastRoute.includes('/login') &&
        !lastRoute.includes('/register') &&
        !lastRoute.includes('/admin/login')) {
      
      hasRestored.current = true;
      console.log('Restaurando rota para:', lastRoute);
      
      // Usar replace para não adicionar à história
      navigate(lastRoute, { replace: true });
    } else {
      console.log('Não é necessário restaurar rota');
    }
  };

  return { restoreLastRoute, saveLastRoute };
};
