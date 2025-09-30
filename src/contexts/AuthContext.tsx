
import React, { createContext, useContext, useMemo, useRef, ReactNode } from 'react';
import { useManualAuth } from '@/hooks/useManualAuth';
import { AuthContextValue } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authValue = useManualAuth();
  const lastRenderRef = useRef<string>('');
  const lastStateRef = useRef<string>('');

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo(() => {
    const renderKey = `${authValue.user?.id}-${authValue.isLoadingAuth}-${authValue.planActive}-${authValue.role}-${authValue.loading}`;
    const stateKey = `${authValue.user?.id}-${authValue.user?.email}-${authValue.isLoadingAuth}-${authValue.planActive}-${authValue.role}-${authValue.loading}-${authValue.permissionsCount}`;

    // Evitar re-renderizações se o estado não mudou realmente
    if (lastStateRef.current === stateKey) {
      return authValue;
    }
    lastStateRef.current = stateKey;

    // Evitar logs duplicados
    if (lastRenderRef.current !== renderKey) {
      console.log('[AuthProvider] Renderizando contexto de autenticação manual');
      console.log('[AuthProvider] Estado atual:', {
        user: authValue.user?.email || 'não logado',
        userId: authValue.user?.id || 'sem ID',
        loading: authValue.loading,
        isLoadingAuth: authValue.isLoadingAuth,
        role: authValue.role,
        plan: authValue.plan,
        planActive: authValue.planActive,
        permissionsCount: authValue.permissions.length
      });
      lastRenderRef.current = renderKey;
    }

    // Adicionar função de logout que redireciona para /login
    const enhancedSignOut = async () => {
      await authValue.signOut();
      window.location.href = '/login';
    };

    return {
      ...authValue,
      signOut: enhancedSignOut
    };
  }, [authValue]);

  return (
    <AuthContext.Provider value={contextValue}>
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
