
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
      // Buscar admin na tabela admins
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, email, password, is_superadmin')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        console.error('AdminContext: Erro ao buscar admin:', adminError);
        throw new Error('Erro ao verificar credenciais de administrador');
      }

      if (!admin) {
        console.log('AdminContext: Admin não encontrado para email:', email);
        throw new Error('Email não encontrado no sistema de administração');
      }

      console.log('AdminContext: Admin encontrado:', { email: admin.email, id: admin.id });

      // Verificar senha - assumindo que pode ser texto simples ou hash bcrypt
      let passwordValid = false;
      
      // Verificar se é um hash bcrypt
      const isBcryptHash = /^\$2[abxy]\$/.test(admin.password);
      
      if (isBcryptHash) {
        try {
          // Usar bcrypt para comparar
          const bcrypt = await import('bcryptjs');
          passwordValid = await bcrypt.compare(password, admin.password);
          console.log('AdminContext: Verificação bcrypt:', passwordValid);
        } catch (bcryptError) {
          console.error('AdminContext: Erro ao verificar hash bcrypt:', bcryptError);
          // Fallback para comparação direta
          passwordValid = password === admin.password;
        }
      } else {
        // Comparação direta
        passwordValid = password === admin.password;
        console.log('AdminContext: Verificação direta de senha:', passwordValid);
      }

      if (!passwordValid) {
        console.log('AdminContext: Senha incorreta');
        throw new Error('Senha incorreta');
      }

      // Criar usuário admin
      const adminUser: AdminUser = {
        id: admin.id,
        email: admin.email,
        role: admin.is_superadmin ? 'superadmin' : 'admin',
        isAdmin: true,
        canAccessFeatures: true
      };

      // Salvar sessão no localStorage (válida por 8 horas)
      const sessionData = {
        user: adminUser,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 horas
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
