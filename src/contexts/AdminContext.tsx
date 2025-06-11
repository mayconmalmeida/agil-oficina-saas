
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminContextValue, AdminUser } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

const AdminContext = createContext<AdminContextValue | null>(null);

export const useAdminContext = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, isLoadingAuth, signOut } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const processUser = () => {
      if (isLoadingAuth) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setAdminUser(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Verificar se é admin
      const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.isAdmin;
      
      if (!isAdmin) {
        setError('Usuário não tem permissões de administrador');
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      // Criar objeto AdminUser
      const adminUserData: AdminUser = {
        id: user.id,
        email: user.email || 'admin@system.com',
        role: (user.role as 'admin' | 'superadmin') || 'admin',
        isAdmin: true,
        canAccessFeatures: true
      };

      setAdminUser(adminUserData);
      setError(null);
      setIsLoading(false);
    };

    processUser();
  }, [user, isLoadingAuth]);

  const checkAdminPermissions = (requiredRole?: 'admin' | 'superadmin'): boolean => {
    if (!adminUser) return false;
    
    if (!requiredRole) return true;
    
    if (requiredRole === 'admin') return true;
    if (requiredRole === 'superadmin') return adminUser.role === 'superadmin';
    
    return false;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAdminUser(null);
      setError(null);
    } catch (error) {
      console.error('Erro ao fazer logout admin:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar logout administrativo"
      });
    }
  };

  const value: AdminContextValue = {
    user: adminUser,
    isLoading,
    error,
    checkAdminPermissions,
    signOut: handleSignOut
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
