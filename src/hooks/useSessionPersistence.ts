
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionPersistence = () => {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    const restoreSession = async () => {
      // Aguardar o carregamento da autenticação
      if (isLoadingAuth) return;

      try {
        // Verificar se há uma sessão ativa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          return;
        }

        // Se há sessão mas usuário não está carregado ainda, aguardar
        if (session && !user) {
          return;
        }

        // Se não há sessão e está em rota protegida, redirecionar para login
        if (!session && !user) {
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

        // Se há sessão e usuário, restaurar última rota
        if (session && user) {
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

    restoreSession();
  }, [user, isLoadingAuth, navigate]);
};
