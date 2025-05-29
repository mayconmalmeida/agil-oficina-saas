
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
    setIsLoadingAuth(true);
    
    setTimeout(async () => {
      const userData = await fetchUserProfile(authUser.id);
      
      const canAccessFeatures = calculateCanAccessFeatures(userData.subscription);
      const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
      
      const userWithData: AuthUser = {
        ...authUser,
        role: userData.role,
        isAdmin,
        canAccessFeatures,
        subscription: userData.subscription
      };
      
      setUser(userWithData);
      setRole(userData.role);
      setIsLoadingAuth(false);
      setLoading(false);
    }, 100);
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
          setUser(null);
          setRole(null);
          setIsLoadingAuth(false);
          setLoading(false);
        }
      }
    );

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          await updateUserWithData(session.user);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
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
