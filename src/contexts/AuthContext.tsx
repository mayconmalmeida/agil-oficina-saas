
import React, { createContext, useContext, useMemo, useRef } from 'react';
import { useManualAuth } from '@/hooks/useManualAuth';
import { AuthContextValue } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    return authValue;
  }, [
    authValue.user?.id,
    authValue.user?.email,
    authValue.loading,
    authValue.isLoadingAuth,
    authValue.role,
    authValue.plan,
    authValue.planActive,
    authValue.permissions.length,
    authValue.isAdmin,
    authValue.canAccessFeatures,
    authValue.oficinaId,
    authValue.signOut
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* Debug UI apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <PlanDebugUI
          plan={authValue.plan}
          active={authValue.planActive}
          permissions={authValue.permissions}
          userId={authValue.user?.id}
        />
      )}
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

// Debug UI para validar plano e userId em tempo real
const PlanDebugUI: React.FC<{
  plan: any;
  active: boolean;
  permissions: string[];
  userId?: string;
}> = ({ plan, active, permissions, userId }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#000',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      opacity: 0.9,
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '250px'
    }}>
      <div>UserId: {userId?.slice(0, 8) || 'null'}</div>
      <div>Plano: {plan || 'null'}</div>
      <div>Status: {active ? 'Ativo' : 'Inativo'}</div>
      <div>Permissões: {permissions.length}</div>
      <div style={{ fontSize: 10, opacity: 0.7 }}>Manual Auth</div>
    </div>
  );
};
