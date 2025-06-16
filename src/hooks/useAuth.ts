
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  role: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    role: null
  });

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          // Buscar role do usuário apenas uma vez
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (!mounted) return;
          
          const userRole = profile?.role || 'user';
          console.log('Role do usuário encontrada:', userRole);
          
          setAuthState({
            user: session.user,
            loading: false,
            role: userRole
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            role: null
          });
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
        if (mounted) {
          setAuthState({
            user: null,
            loading: false,
            role: null
          });
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (!mounted) return;
          
          const userRole = profile?.role || 'user';
          
          setAuthState({
            user: session.user,
            loading: false,
            role: userRole
          });
        } catch (error) {
          console.error('Erro ao buscar role:', error);
          if (mounted) {
            setAuthState({
              user: session.user,
              loading: false,
              role: 'user'
            });
          }
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          role: null
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
