
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const isNavigating = useRef(false);

  // Salvar a rota atual - com throttling para evitar muitas escritas
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Não salvar certas rotas
    const routesToIgnore = ['/login', '/register', '/', '/admin/login'];
    
    if (!routesToIgnore.includes(currentPath) && !isNavigating.current) {
      // Throttle para evitar muitas escritas no localStorage
      const timer = setTimeout(() => {
        localStorage.setItem('lastRoute', currentPath);
        console.log('Rota salva:', currentPath);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Recuperar rota com proteção contra loops
  const restoreLastRoute = () => {
    // Múltiplas proteções contra loops
    if (hasNavigated.current || isNavigating.current) {
      console.log('Restauração de rota cancelada - já navegou ou está navegando');
      return;
    }
    
    const lastRoute = localStorage.getItem('lastRoute');
    const currentPath = window.location.pathname;
    
    console.log('Tentando restaurar rota:', { lastRoute, currentPath });
    
    // Verificações adicionais para evitar loops
    if (lastRoute && 
        (currentPath === '/' || currentPath === '') &&
        lastRoute !== currentPath &&
        !lastRoute.includes('/login') &&
        !lastRoute.includes('/register')) {
      
      hasNavigated.current = true;
      isNavigating.current = true;
      
      console.log('Navegando para:', lastRoute);
      
      // Timeout para evitar interferência com outros sistemas de navegação
      setTimeout(() => {
        navigate(lastRoute, { replace: true });
        setTimeout(() => {
          isNavigating.current = false;
        }, 1000);
      }, 100);
    }
  };

  return { restoreLastRoute };
};
