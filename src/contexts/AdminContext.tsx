
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminUser, AdminContextValue } from '@/types/admin';

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminSession = async () => {
    console.log('AdminContext: Verificando sessão admin...');
    try {
      // Verificar se há sessão ativa no Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('AdminContext: Erro ao verificar sessão:', sessionError);
        setError('Erro ao verificar sessão');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!session?.user) {
        console.log('AdminContext: Nenhuma sessão ativa encontrada');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verificar se o usuário é admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('AdminContext: Erro ao buscar perfil:', profileError);
        setError('Erro ao verificar permissões');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.log('AdminContext: Perfil não encontrado');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
      
      if (isAdmin) {
        const adminUser: AdminUser = {
          id: session.user.id,
          email: profile.email,
          role: profile.role as 'admin' | 'superadmin',
          isAdmin: true,
          canAccessFeatures: true,
          sessionToken: session.access_token,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined
        };

        console.log('AdminContext: Admin autenticado:', profile.email);
        setUser(adminUser);
        setError(null);
      } else {
        console.log('AdminContext: Usuário não é admin, role:', profile.role);
        setUser(null);
      }
    } catch (error) {
      console.error('AdminContext: Erro geral:', error);
      setError('Erro ao verificar sessão de administrador');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    console.log('AdminContext: Iniciando login admin para:', email);
    setIsLoading(true);
    setError(null);

    try {
      // Fazer login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('AdminContext: Erro de autenticação:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Dados do usuário não encontrados');
      }

      // Verificar se é admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('AdminContext: Erro ao verificar role:', profileError);
        throw new Error('Erro ao verificar permissões');
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
      
      if (!isAdmin) {
        console.log('AdminContext: Usuário não é admin, role:', profile.role);
        await supabase.auth.signOut();
        throw new Error('Acesso negado: usuário não é administrador');
      }

      const adminUser: AdminUser = {
        id: authData.user.id,
        email: profile.email,
        role: profile.role as 'admin' | 'superadmin',
        isAdmin: true,
        canAccessFeatures: true,
        sessionToken: authData.session?.access_token,
        expiresAt: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : undefined
      };

      setUser(adminUser);
      setError(null);
      console.log('AdminContext: Login admin bem-sucedido');
      return true;

    } catch (err: any) {
      console.error('AdminContext: Erro no login admin:', err);
      setError(err.message || 'Erro durante o login');
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AdminContext: Fazendo logout admin');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('AdminContext: Erro no logout:', error);
    }
  };

  const checkAdminPermissions = (requiredRole?: 'admin' | 'superadmin'): boolean => {
    if (!user || !user.isAdmin) return false;
    
    if (requiredRole === 'superadmin') {
      return user.role === 'superadmin';
    }
    
    return user.role === 'admin' || user.role === 'superadmin';
  };

  useEffect(() => {
    checkAdminSession();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AdminContext: Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Verificar se é admin quando faz login
        await checkAdminSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AdminContextValue = {
    user,
    isLoading,
    error,
    checkAdminPermissions,
    signOut,
    loginAdmin
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
