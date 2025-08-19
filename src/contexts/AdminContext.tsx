
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
    console.log('AdminContext: Verificando sessão admin existente...');
    try {
      // Verificar se existe uma sessão ativa no localStorage
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        const sessionData = JSON.parse(adminSession);
        
        // Verificar se a sessão ainda é válida (não expirada)
        if (sessionData.expiresAt && new Date(sessionData.expiresAt) > new Date()) {
          console.log('AdminContext: Sessão admin válida encontrada');
          setUser(sessionData.user);
          setIsLoading(false);
          return;
        } else {
          // Sessão expirada, remover
          localStorage.removeItem('admin_session');
        }
      }

      console.log('AdminContext: Nenhuma sessão admin válida encontrada');
      setUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error('AdminContext: Erro ao verificar sessão:', error);
      setError('Erro ao verificar sessão de administrador');
      setUser(null);
      setIsLoading(false);
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    console.log('AdminContext: Iniciando login admin para:', email);
    setIsLoading(true);
    setError(null);

    try {
      // Usar a Edge Function para login seguro
      const { data, error: functionError } = await supabase.functions.invoke('admin-login', {
        body: { email, password }
      });

      if (functionError) {
        console.error('AdminContext: Erro na Edge Function:', functionError);
        throw new Error('Erro na comunicação com o servidor');
      }

      if (!data.success) {
        console.log('AdminContext: Login rejeitado:', data.error);
        throw new Error(data.error || 'Credenciais inválidas');
      }

      const adminUser: AdminUser = data.user;

      // Salvar sessão no localStorage
      const sessionData = {
        user: adminUser,
        expiresAt: adminUser.expiresAt
      };
      localStorage.setItem('admin_session', JSON.stringify(sessionData));

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
    localStorage.removeItem('admin_session');
    setUser(null);
    setError(null);
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
