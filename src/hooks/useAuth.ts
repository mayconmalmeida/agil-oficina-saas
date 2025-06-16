
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AuthState } from '@/types/auth';

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    loading: boolean;
    role: string | null;
  }>({
    user: null,
    loading: true,
    role: null
  });
  
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const getSession = async () => {
      try {
        console.log('useAuth: Iniciando verificação de sessão');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('useAuth: Erro ao obter sessão:', error);
          setAuthState({
            user: null,
            loading: false,
            role: null
          });
          return;
        }
        
        if (session?.user) {
          console.log('useAuth: Sessão encontrada, buscando perfil...');
          try {
            // Definir timeout para evitar loading infinito
            const profilePromise = supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(() => reject(new Error('Timeout')), 10000);
            });
            
            const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
            
            if (timeoutId) clearTimeout(timeoutId);
            
            if (!mounted) return;
            
            const userRole = profile?.role || 'user';
            console.log('useAuth: Role do usuário:', userRole);
            
            setAuthState({
              user: session.user,
              loading: false,
              role: userRole
            });
          } catch (profileError) {
            console.warn('useAuth: Erro ao buscar perfil, usando role padrão:', profileError);
            if (mounted) {
              setAuthState({
                user: session.user,
                loading: false,
                role: 'user'
              });
            }
          }
        } else {
          console.log('useAuth: Nenhuma sessão encontrada');
          setAuthState({
            user: null,
            loading: false,
            role: null
          });
        }
      } catch (error) {
        console.error('useAuth: Erro geral na autenticação:', error);
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
      
      console.log('useAuth: Auth state change:', event);
      
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
          console.error('useAuth: Erro ao buscar role na mudança de estado:', error);
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

    // Timeout de segurança para garantir que loading não fique infinito
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('useAuth: Timeout de segurança ativado, definindo loading como false');
        setAuthState(prev => ({
          ...prev,
          loading: false
        }));
      }
    }, 15000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar logout."
      });
    }
  }, [toast]);

  const isAdmin = authState.role === 'admin' || authState.role === 'superadmin';
  const isLoadingAuth = authState.loading;

  return {
    user: authState.user,
    session: null,
    loading: authState.loading,
    isLoadingAuth,
    role: authState.role,
    isAdmin,
    signOut
  };
};
