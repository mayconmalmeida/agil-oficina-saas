
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
        }
      }
      
      console.log('AdminContext: Nenhuma sessão admin válida encontrada');
      setIsLoading(false);
    } catch (error) {
      console.error('AdminContext: Erro ao verificar sessão admin:', error);
      setError('Erro ao verificar sessão admin');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AdminContext: Tentando fazer login admin...', {
      email,
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });
    setIsLoading(true);
    setError(null);

    try {
      // Autenticação simplificada para desenvolvimento
      // Credenciais de teste: admin@test.com / admin123
      const validCredentials = [
        { email: 'admin@test.com', password: 'admin123', role: 'admin' },
        { email: 'mayconintermediacao@gmail.com', password: 'admin123', role: 'superadmin' }
      ];

      const validAdmin = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (!validAdmin) {
        console.log('AdminContext: Credenciais admin inválidas');
        setError('Email ou senha inválidos');
        setIsLoading(false);
        return false;
      }

      const adminUser: AdminUser = {
        id: `admin-${Date.now()}`, // ID temporário
        email: validAdmin.email,
        role: validAdmin.role as 'admin' | 'superadmin',
        isAdmin: true,
        canAccessFeatures: true
      };

      console.log('AdminContext: Usuário admin criado:', {
        adminUser,
        timestamp: new Date().toISOString()
      });

      // Salvar sessão no localStorage com expiração
      const sessionData = {
        user: adminUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };
      
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      
      setUser(adminUser);
      setIsLoading(false);
      
      console.log('AdminContext: Login admin realizado com sucesso');
      return true;
    } catch (error) {
      console.error('AdminContext: Erro no login admin:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      setError('Erro interno do servidor');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('AdminContext: Fazendo logout admin...');
    localStorage.removeItem('admin_session');
    setUser(null);
    setError(null);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    checkAdminSession();
  }, []);

  const value: AdminContextValue = {
    user,
    isLoading,
    error,
    loginAdmin: login,
    signOut: logout,
    checkAdminPermissions: (requiredRole?: 'admin' | 'superadmin') => {
      if (!user) return false;
      if (requiredRole === 'superadmin') {
        return user.role === 'superadmin';
      }
      return user.role === 'admin' || user.role === 'superadmin';
    }
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
};

export const useAdminContext = useAdmin;
