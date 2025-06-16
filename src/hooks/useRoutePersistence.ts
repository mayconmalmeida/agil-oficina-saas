
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Salvar a rota atual no localStorage sempre que ela mudar
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Não salvar certas rotas (login, registro, etc.)
    const routesToIgnore = ['/login', '/register', '/', '/admin/login'];
    
    if (!routesToIgnore.includes(currentPath)) {
      localStorage.setItem('lastRoute', currentPath);
    }
  }, [location.pathname]);

  // Recuperar e navegar para a última rota ao carregar o app
  const restoreLastRoute = () => {
    const lastRoute = localStorage.getItem('lastRoute');
    const currentPath = window.location.pathname;
    
    // Se estiver na home page e há uma rota salva, navegar para ela
    if (lastRoute && (currentPath === '/' || currentPath === '')) {
      navigate(lastRoute, { replace: true });
    }
  };

  return { restoreLastRoute };
};
