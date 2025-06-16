
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const useSessionPersistence = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Verificar se há uma sessão ativa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          return;
        }

        // Se não há sessão e está em rota protegida, redirecionar para login
        if (!session) {
          const currentPath = window.location.pathname;
          const protectedRoutes = ['/dashboard'];
          const isProtectedRoute = protectedRoutes.some(route => 
            currentPath.startsWith(route)
          );
          
          if (isProtectedRoute) {
            navigate('/login', { replace: true });
            return;
          }
        }

        // Se há sessão, restaurar última rota
        if (session) {
          const lastRoute = localStorage.getItem('lastRoute');
          const currentPath = window.location.pathname;
          
          // Se está na home ou login e há rota salva, navegar para ela
          if (lastRoute && (currentPath === '/' || currentPath === '/login')) {
            navigate(lastRoute, { replace: true });
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
      }
    };

    // Executar após um pequeno delay para garantir que os contextos estejam carregados
    const timer = setTimeout(restoreSession, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);
};
