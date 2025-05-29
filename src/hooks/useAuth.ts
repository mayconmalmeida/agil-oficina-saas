
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AuthUser extends User {
  role?: string;
  isAdmin?: boolean;
  canAccessFeatures?: boolean;
  subscription?: {
    status: string;
    trial_ends_at?: string;
    ends_at?: string;
  };
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoadingAuth: boolean;
  role: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthContextValue => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        return { role: 'user', subscription: null };
      }

      const userRole = profileData?.role || 'user';

      // Buscar assinatura do usuário
      const { data: subscriptionData } = await supabase.rpc('get_user_subscription');
      
      let subscription = null;
      if (subscriptionData?.success && subscriptionData?.has_subscription) {
        subscription = subscriptionData.subscription;
      }

      return { role: userRole, subscription };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return { role: 'user', subscription: null };
    }
  };

  const calculateCanAccessFeatures = (subscription: any): boolean => {
    if (!subscription) return false;
    
    const now = new Date();
    
    // Assinatura paga ativa
    if (subscription.status === 'active' && subscription.ends_at) {
      return new Date(subscription.ends_at) > now;
    }
    
    // Trial ativo
    if (subscription.status === 'trialing' && subscription.trial_ends_at) {
      return new Date(subscription.trial_ends_at) > now;
    }
    
    return false;
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
          setIsLoadingAuth(true);
          
          // Buscar dados do usuário de forma assíncrona
          setTimeout(async () => {
            if (!mounted) return;
            
            const userData = await fetchUserData(session.user.id);
            
            if (!mounted) return;
            
            const canAccessFeatures = calculateCanAccessFeatures(userData.subscription);
            const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
            
            const userWithData: AuthUser = {
              ...session.user,
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
          setIsLoadingAuth(true);
          
          const userData = await fetchUserData(session.user.id);
          
          if (!mounted) return;
          
          const canAccessFeatures = calculateCanAccessFeatures(userData.subscription);
          const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
          
          const userWithData: AuthUser = {
            ...session.user,
            role: userData.role,
            isAdmin,
            canAccessFeatures,
            subscription: userData.subscription
          };
          
          setUser(userWithData);
          setRole(userData.role);
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

  const signOut = async () => {
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
  };

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin: role === 'admin' || role === 'superadmin',
    signOut
  };
};
