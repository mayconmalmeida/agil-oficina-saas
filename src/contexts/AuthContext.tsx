
import React, { createContext, useContext } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useUserPlanSetup } from '@/hooks/useUserPlanSetup';
import { AuthContextValue } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider: Renderizando contexto de autenticação');
  const authValue = useOptimizedAuth();
  
  // Configurar plano automaticamente para novos usuários
  useUserPlanSetup();
  
  console.log('AuthProvider: Estado atual:', {
    user: authValue.user?.email || 'não logado',
    loading: authValue.loading,
    isLoadingAuth: authValue.isLoadingAuth,
    role: authValue.role
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
