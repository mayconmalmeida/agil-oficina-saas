
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { fetchUserProfile, calculateCanAccessFeatures } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const updateUserWithData = async (authUser: User) => {
    try {
      console.log('Buscando dados do perfil para usuário:', authUser.id);
      setIsLoadingAuth(true);
      
      const userData = await fetchUserProfile(authUser.id);
      
      // Priorizar role de admin - admin sempre tem acesso total
      const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
      const canAccessFeatures = isAdmin ? true : calculateCanAccessFeatures(userData.subscription);
      
      console.log('Dados do usuário carregados:', {
        role: userData.role,
        isAdmin,
        canAccessFeatures,
        hasSubscription: !!userData.subscription
      });
      
      const userWithData: AuthUser = {
        ...authUser,
        role: userData.role,
        isAdmin,
        canAccessFeatures,
        subscription: userData.subscription
      };
      
      setUser(userWithData);
      setRole(userData.role);
      
      console.log('Estado do usuário atualizado completamente');
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      // Em caso de erro, define usuário sem dados extras
      setUser({
        ...authUser,
        role: 'user',
        isAdmin: false,
        canAccessFeatures: false,
        subscription: null
      });
      setRole('user');
    } finally {
      // CRÍTICO: Sempre definir isLoadingAuth como false após o processamento
      console.log('Finalizando carregamento de autenticação');
      setIsLoadingAuth(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await updateUserWithData(session.user);
        } else {
          console.log('Usuário deslogado, limpando estado');
          setUser(null);
          setRole(null);
          setIsLoadingAuth(false);
          setLoading(false);
        }
      }
    );

    // Verificar sessão existente na inicialização
    const initializeAuth = async () => {
      try {
        console.log('Inicializando verificação de autenticação...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          console.log('Sessão existente encontrada, carregando dados do usuário');
          await updateUserWithData(session.user);
        } else {
          console.log('Nenhuma sessão encontrada');
          setIsLoadingAuth(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        if (mounted) {
          setIsLoadingAuth(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
