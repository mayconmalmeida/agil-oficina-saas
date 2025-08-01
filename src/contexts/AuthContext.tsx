
import React, { createContext, useContext } from 'react';
import { useManualAuth } from '@/hooks/useManualAuth';
import { AuthContextValue } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AuthProvider] Renderizando contexto de autenticação manual');
  const authValue = useManualAuth();

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

  return (
    <AuthContext.Provider value={authValue}>
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
      <div style={{ fontSize: '10px', opacity: 0.7 }}>Manual Auth</div>
    </div>
  );
};
