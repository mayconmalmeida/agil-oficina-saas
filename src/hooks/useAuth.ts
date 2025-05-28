
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AuthUser extends User {
  role?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthContextValue => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar role do usuário:', error);
        return 'user'; // Role padrão
      }

      return data?.role || 'user';
    } catch (error) {
      console.error('Erro ao buscar role:', error);
      return 'user';
    }
  };

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          const userWithRole: AuthUser = {
            ...session.user,
            role: userRole
          };
          setUser(userWithRole);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        const userWithRole: AuthUser = {
          ...session.user,
          role: userRole
        };
        setUser(userWithRole);
        setRole(userRole);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    role,
    isAdmin: role === 'admin' || role === 'superadmin',
    signOut
  };
};
