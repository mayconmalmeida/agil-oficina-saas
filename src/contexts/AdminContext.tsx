
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminUser, AdminContextValue, AdminRole } from '@/types/admin';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const useAdminContext = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminSession();
    
    // Escutar mudanças na sessão do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AdminContext: Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          setError(null);
        } else if (session?.user) {
          await validateAdminUser(session.user.email);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminSession = async () => {
    try {
      setIsLoading(true);
      console.log('AdminContext: Verificando sessão admin existente...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        console.log('AdminContext: Sessão encontrada, validando admin:', session.user.email);
        await validateAdminUser(session.user.email);
      } else {
        console.log('AdminContext: Nenhuma sessão encontrada');
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('AdminContext: Erro ao verificar sessão:', error);
      setError('Erro ao verificar sessão');
      setIsLoading(false);
    }
  };

  const validateAdminUser = async (email: string) => {
    try {
      console.log('AdminContext: Validando admin na tabela admins:', email);
      
      // Verificar na tabela admins
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, email, is_superadmin')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        console.error('AdminContext: Erro ao buscar admin:', adminError);
        throw new Error('Erro ao verificar permissões de admin');
      }

      if (!adminData) {
        console.log('AdminContext: Email não é admin:', email);
        setUser(null);
        setError('Usuário não é administrador');
        setIsLoading(false);
        return;
      }

      // Criar usuário admin
      const adminUser: AdminUser = {
        id: adminData.id,
        email: adminData.email,
        role: adminData.is_superadmin ? 'superadmin' : 'admin',
        isAdmin: true,
        canAccessFeatures: true
      };

      console.log('AdminContext: Admin validado com sucesso:', adminUser);
      setUser(adminUser);
      setError(null);
      setIsLoading(false);

    } catch (error) {
      console.error('AdminContext: Erro na validação de admin:', error);
      setUser(null);
      setError(error instanceof Error ? error.message : 'Erro na validação');
      setIsLoading(false);
    }
  };

  const checkAdminPermissions = (requiredRole?: AdminRole): boolean => {
    if (!user || !user.isAdmin) {
      return false;
    }

    if (!requiredRole) {
      return true; // Qualquer admin pode acessar
    }

    if (requiredRole === 'superadmin') {
      return user.role === 'superadmin';
    }

    return user.role === 'admin' || user.role === 'superadmin';
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('AdminContext: Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setError(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('AdminContext: Erro no logout:', error);
      throw error;
    }
  };

  const contextValue: AdminContextValue = {
    user,
    isLoading,
    error,
    checkAdminPermissions,
    signOut
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
